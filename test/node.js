const fs = require('fs');
const path = require('path');
const process = require('process');
const { fork } = require('child_process');
const log = require('@vladmandic/pilogger');

let logFile = 'test.log';
log.configure({ inspect: { breakLength: 350 } });

const tests = [
  'test-node-load.js',
  'test-node-gear.js',
  'test-backend-node.js',
  'test-backend-node-gpu.js',
  'test-backend-node-wasm.js',
  // 'test-backend-node-cpu.js',
];

const demos = [
  { cmd: '../demo/nodejs/node.js', args: [] },
  { cmd: '../demo/nodejs/node-simple.js', args: [] },
  { cmd: '../demo/nodejs/node-event.js', args: ['samples/in/ai-body.jpg'] },
  { cmd: '../demo/nodejs/node-similarity.js', args: ['samples/in/ai-face.jpg', 'samples/in/ai-upper.jpg'] },
  { cmd: '../demo/nodejs/node-canvas.js', args: ['samples/in/ai-body.jpg', 'samples/out/ai-body.jpg'] },
  { cmd: '../demo/nodejs/process-folder.js', args: ['samples'] },
  { cmd: '../demo/multithread/node-multiprocess.js', args: [] },
  { cmd: '../demo/facematch/node-match.js', args: [] },
  { cmd: '../demo/nodejs/node-bench.js', args: [] },
  { cmd: '../test/test-node-emotion.js', args: [] },
  // { cmd: '../demo/nodejs/node-video.js', args: [] },
  // { cmd: '../demo/nodejs/node-webcam.js', args: [] },
];

const ignoreMessages = [
  'cpu_feature_guard.cc',
  'rebuild TensorFlow',
  'xla_gpu_device.cc',
  'cudart_stub.cc',
  'cuda_driver.cc:326',
  'cpu_allocator_impl.cc',
  '--trace-warnings',
  'ExperimentalWarning',
];

const failedMessages = [];

const status = {};

function logMessage(test, data) {
  if (!status[test]) status[test] = { passed: 0, failed: 0 };
  if (log[data[0]]) {
    log[data[0]](test, ...data[1]);
  } else {
    log.error('unknown facility', test, ...data[1]);
    status[test].failed++;
  }
  if (data[1][0].startsWith('passed')) status[test].passed++;
  if (data[1][0].startsWith('failed')) {
    status[test].failed++;
    failedMessages.push({ test, data });
  }
}

function logStdIO(ok, test, buffer) {
  const lines = buffer.toString().split(/\r\n|\n\r|\n|\r/);
  const filtered = lines.filter((line) => {
    for (const ignoreString of ignoreMessages) {
      if (line.includes(ignoreString)) return false;
    }
    return true;
  });
  for (const line of filtered) {
    if (line.length < 2) continue;
    if (ok) {
      log.data(test, 'stdout:', line);
    } else {
      if (status[test]) status[test].failed = 'critical';
      log.warn(test, 'stderr:', line);
    }
  }
}

async function runTest(test) {
  log.info();
  log.info(test, 'start');
  return new Promise((resolve) => {
    const child = fork(path.join(__dirname, test), [], { silent: true });
    child.on('message', (data) => logMessage(test, data));
    child.on('error', (data) => log.error(test, ':', data.message || data));
    child.on('close', (code) => resolve(code));
    child.stdout?.on('data', (data) => logStdIO(true, test, data));
    child.stderr?.on('data', (data) => logStdIO(false, test, data));
  });
}

async function runDemo(demo) {
  // log.info();
  log.info(demo, 'start');
  status[demo.cmd] = { passed: 0, failed: 0 };
  return new Promise((resolve) => {
    const child = fork(path.join(__dirname, demo.cmd), [...demo.args], { silent: true });
    child.on('message', (data) => logMessage(demo.cmd, data));
    child.on('error', (data) => {
      status[demo.cmd].failed++;
      log.error(demo.cmd, ':', data.message || data);
    });
    child.on('close', (code) => {
      status[demo.cmd].passed++;
      resolve(code);
    });
    // child.stdout?.on('data', (data) => logStdIO(true, demo.cmd, data));
    child.stderr?.on('data', (data) => logStdIO(false, demo.cmd, data));
  });
}

async function testAll() {
  logFile = path.join(__dirname, logFile);
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log.logFile(logFile);
  log.header();
  process.on('unhandledRejection', (data) => log.error('nodejs unhandled rejection', data));
  process.on('uncaughtException', (data) => log.error('nodejs unhandled exception', data));
  log.info('demos:', demos);
  for (const demo of demos) await runDemo(demo);
  log.info('tests:', tests);
  for (const test of tests) await runTest(test);
  log.state('all tests complete');
  for (const [test, result] of Object.entries(status)) {
    log.info('  status', { test, ...result });
  }
  log.info('failures', { count: failedMessages.length });
  for (const msg of failedMessages) log.warn('  failed', { test: msg.test, message: msg.data });
}

testAll();
