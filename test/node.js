const fs = require('fs');
const path = require('path');
const process = require('process');
const { fork } = require('child_process');
const log = require('@vladmandic/pilogger');

let logFile = 'test.log';

const tests = [
  'test-node.js',
  'test-node-gpu.js',
  'test-node-wasm.js',
];

const demos = [
  '../demo/nodejs/node.js',
  '../demo/nodejs/node-canvas.js',
  '../demo/nodejs/node-env.js',
  '../demo/nodejs/node-event.js',
  '../demo/nodejs/node-multiprocess.js',
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
    if (ok) log.data(test, 'stdout:', line);
    else log.warn(test, 'stderr:', line);
  }
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
async function runDemo(demo) {
  log.info();
  log.info(demo, 'start');
  return new Promise((resolve) => {
    const child = fork(path.join(__dirname, demo), [], { silent: true });
    child.on('message', (data) => logMessage(demo, data));
    child.on('error', (data) => log.error(demo, ':', data.message || data));
    child.on('close', (code) => resolve(code));
    child.stdout?.on('data', (data) => logStdIO(true, demo, data));
    child.stderr?.on('data', (data) => logStdIO(false, demo, data));
  });
}

async function testAll() {
  logFile = path.join(__dirname, logFile);
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log.logFile(logFile);
  log.header();
  process.on('unhandledRejection', (data) => log.error('nodejs unhandled rejection', data));
  process.on('uncaughtException', (data) => log.error('nodejs unhandled exception', data));
  log.info('tests:', tests);
  log.info('demos:', demos);
  // for (const demo of demos) await runDemo(demo);
  for (const test of tests) await runTest(test);
  log.info('all tests complete');
  log.info('failed:', { count: failedMessages.length, messages: failedMessages });
  log.info('status:', status);
}

testAll();
