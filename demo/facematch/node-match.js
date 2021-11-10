const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const threads = require('worker_threads');

// global optinos
const options = {
  dbFile: 'demo/facematch/faces.json', // sample face db
  dbMax: 10000, // maximum number of records to hold in memory
  threadPoolSize: 12, // number of worker threads to create in thread pool
  workerSrc: './node-match-worker.js', // code that executes in the worker thread
  debug: false, // verbose messages
  minThreshold: 0.5, // match returns first record that meets the similarity threshold, set to 0 to always scan all records
  descLength: 1024, // descriptor length
};

// test options
const testOptions = {
  dbFact: 175, // load db n times to fake huge size
  maxJobs: 200, // exit after processing this many jobs
  fuzDescriptors: true, // randomize descriptor content before match for harder jobs
};

// global data structures
const data = {
  /** @type string[] */
  labels: [], // array of strings, length of array serves as overal number of records so has to be maintained carefully
  /** @type SharedArrayBuffer | null */
  buffer: null,
  /** @type Float32Array | null */
  view: null,
  /** @type threads.Worker[] */
  workers: [], // holds instance of workers. worker can be null if exited
  requestID: 0, // each request should increment this counter as its used for round robin assignment
};

let t0 = process.hrtime.bigint(); // used for perf counters

const appendRecords = (labels, descriptors) => {
  if (!data.view) return 0;
  if (descriptors.length !== labels.length) {
    log.error('append error:', { descriptors: descriptors.length, labels: labels.length });
  }
  // if (options.debug) log.state('appending:', { descriptors: descriptors.length, labels: labels.length });
  for (let i = 0; i < descriptors.length; i++) {
    for (let j = 0; j < descriptors[i].length; j++) {
      data.view[data.labels.length * descriptors[i].length + j] = descriptors[i][j]; // add each descriptors element to buffer
    }
    data.labels.push(labels[i]); // finally add to labels
  }
  for (const worker of data.workers) { // inform all workers how many records we have
    if (worker) worker.postMessage({ records: data.labels.length });
  }
  return data.labels.length;
};

const getLabel = (index) => data.labels[index];

const getDescriptor = (index) => {
  if (!data.view) return [];
  const descriptor = [];
  for (let i = 0; i < 1024; i++) descriptor.push(data.view[index * options.descLength + i]);
  return descriptor;
};

const fuzDescriptor = (descriptor) => {
  for (let i = 0; i < descriptor.length; i++) descriptor[i] += Math.random() - 0.5;
  return descriptor;
};

const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function workersClose() {
  const current = data.workers.filter((worker) => !!worker).length;
  log.info('closing workers:', { poolSize: data.workers.length, activeWorkers: current });
  for (const worker of data.workers) {
    if (worker) worker.postMessage({ shutdown: true }); // tell worker to exit
  }
  await delay(250); // wait a little for threads to exit on their own
  const remaining = data.workers.filter((worker) => !!worker).length;
  if (remaining > 0) {
    log.info('terminating remaining workers:', { remaining: current, pool: data.workers.length });
    for (const worker of data.workers) {
      if (worker) worker.terminate(); // if worker did not exit cleany terminate it
    }
  }
}

const workerMessage = (index, msg) => {
  if (msg.request) {
    if (options.debug) log.data('message:', { worker: index, request: msg.request, time: msg.time, label: getLabel(msg.index), similarity: msg.similarity });
    if (msg.request >= testOptions.maxJobs) {
      const t1 = process.hrtime.bigint();
      const elapsed = Math.round(Number(t1 - t0) / 1000 / 1000);
      log.state({ matchJobsFinished: testOptions.maxJobs, totalTimeMs: elapsed, averageTimeMs: Math.round(100 * elapsed / testOptions.maxJobs) / 100 });
      workersClose();
    }
  } else {
    log.data('message:', { worker: index, msg });
  }
};

async function workerClose(id, code) {
  const previous = data.workers.filter((worker) => !!worker).length;
  delete data.workers[id];
  const current = data.workers.filter((worker) => !!worker).length;
  if (options.debug) log.state('worker exit:', { id, code, previous, current });
}

async function workersStart(numWorkers) {
  const previous = data.workers.filter((worker) => !!worker).length;
  log.info('starting worker thread pool:', { totalWorkers: numWorkers, alreadyActive: previous });
  for (let i = 0; i < numWorkers; i++) {
    if (!data.workers[i]) { // worker does not exist, so create it
      const worker = new threads.Worker(path.join(__dirname, options.workerSrc));
      worker.on('message', (msg) => workerMessage(i, msg));
      worker.on('error', (err) => log.error('worker error:', { err }));
      worker.on('exit', (code) => workerClose(i, code));
      worker.postMessage(data.buffer); // send buffer to worker
      data.workers[i] = worker;
    }
    data.workers[i]?.postMessage({ records: data.labels.length, threshold: options.minThreshold, debug: options.debug }); // inform worker how many records there are
  }
  await delay(100); // just wait a bit for everything to settle down
}

const match = (descriptor) => {
  // const arr = Float32Array.from(descriptor);
  const buffer = new ArrayBuffer(options.descLength * 4);
  const view = new Float32Array(buffer);
  view.set(descriptor);
  const available = data.workers.filter((worker) => !!worker).length; // find number of available workers
  if (available > 0) data.workers[data.requestID % available].postMessage({ descriptor: buffer, request: data.requestID }, [buffer]); // round robin to first available worker
  else log.error('no available workers');
};

async function loadDB(count) {
  const previous = data.labels.length;
  if (!fs.existsSync(options.dbFile)) {
    log.error('db file does not exist:', options.dbFile);
    return;
  }
  t0 = process.hrtime.bigint();
  for (let i = 0; i < count; i++) { // test loop: load entire face db from array of objects n times into buffer
    const db = JSON.parse(fs.readFileSync(options.dbFile).toString());
    const names = db.map((record) => record.name);
    const descriptors = db.map((record) => record.embedding);
    appendRecords(names, descriptors);
  }
  log.data('db loaded:', { existingRecords: previous, newRecords: data.labels.length });
}

async function createBuffer() {
  data.buffer = new SharedArrayBuffer(4 * options.dbMax * options.descLength); // preallocate max number of records as sharedarraybuffers cannot grow
  data.view = new Float32Array(data.buffer); // create view into buffer
  data.labels.length = 0;
  log.data('created shared buffer:', { maxDescriptors: (data.view?.length || 0) / options.descLength, totalBytes: data.buffer.byteLength, totalElements: data.view?.length });
}

async function main() {
  log.header();
  log.info('options:', options);

  await createBuffer(); // create shared buffer array
  await loadDB(testOptions.dbFact); // loadDB is a test method that calls actual addRecords
  await workersStart(options.threadPoolSize); // can be called at anytime to modify worker pool size
  for (let i = 0; i < testOptions.maxJobs; i++) {
    const idx = Math.trunc(data.labels.length * Math.random()); // grab a random descriptor index that we'll search for
    const descriptor = getDescriptor(idx); // grab a descriptor at index
    data.requestID++; // increase request id
    if (testOptions.fuzDescriptors) match(fuzDescriptor(descriptor)); // fuz descriptor for harder match
    else match(descriptor);
    if (options.debug) log.info('submited job', data.requestID); // we already know what we're searching for so we can compare results
  }
  log.state('submitted:', { matchJobs: testOptions.maxJobs, poolSize: data.workers.length, activeWorkers: data.workers.filter((worker) => !!worker).length });
}

main();
