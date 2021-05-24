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

const ignore = [
  'cpu_feature_guard.cc',
  'rebuild TensorFlow',
  'xla_gpu_device.cc',
  'cudart_stub.cc',
  'cuda_driver.cc:326',
  'cpu_allocator_impl.cc',
];

const status = {
  passed: 0,
  failed: 0,
};

function logMessage(test, data) {
  log[data[0]](test, ...data[1]);
  if (data[1][0].startsWith('passed')) status.passed++;
  if (data[1][0].startsWith('failed')) status.failed++;
}

function logStdIO(ok, test, buffer) {
  const lines = buffer.toString().split(/\r\n|\n\r|\n|\r/);
  const filtered = lines.filter((line) => {
    for (const ignoreString of ignore) {
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

async function runTest(test) {
  return new Promise((resolve) => {
    log.info(test, 'start');
    const child = fork(path.join(__dirname, test), [], { silent: true });
    child.on('message', (data) => logMessage(test, data));
    child.on('error', (data) => log.error(test, ':', data.message || data));
    child.on('close', (code) => resolve(code));
    child.stdout?.on('data', (data) => logStdIO(true, test, data));
    child.stderr?.on('data', (data) => logStdIO(false, test, data));
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
  for (const test of tests) await runTest(test);
  log.info('status:', status);
}

testAll();
