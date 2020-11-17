#!/usr/bin/env -S node --trace-warnings

const esbuild = require('esbuild');
const log = require('@vladmandic/pilogger');

// keeps esbuild service instance cached
let es;

// common configuration
const common = {
  minifyWhitespace: true,
  bundle: true,
  sourcemap: true,
  logLevel: 'error',
  target: 'es2018',
};

// all build targets
const config = {
  iifeBundle: {
    platform: 'browser',
    format: 'iife',
    globalName: 'Human',
    metafile: 'dist/human.json',
    entryPoints: ['src/human.js'],
    outfile: 'dist/human.js',
    external: ['fs', 'buffer', 'util'],
  },
  esmBundle: {
    platform: 'browser',
    format: 'esm',
    metafile: 'dist/human.esm.json',
    entryPoints: ['src/human.js'],
    outfile: 'dist/human.esm.js',
    external: ['fs', 'buffer', 'util'],
  },
  esmNoBundle: {
    platform: 'browser',
    format: 'esm',
    metafile: 'dist/human.esm-nobundle.json',
    entryPoints: ['src/human.js'],
    outfile: 'dist/human.esm-nobundle.js',
    external: ['fs', 'buffer', 'util', '@tensorflow'],
  },
  nodeBundle: {
    platform: 'node',
    format: 'cjs',
    metafile: 'dist/human.node.json',
    entryPoints: ['src/human.js'],
    outfile: 'dist/human.node.js',
  },
  nodeNoBundle: {
    platform: 'node',
    format: 'cjs',
    metafile: 'dist/human.node-nobundle.json',
    entryPoints: ['src/human.js'],
    outfile: 'dist/human.node-nobundle.js',
    external: ['@tensorflow'],
  },
  demo: {
    platform: 'browser',
    format: 'esm',
    metafile: 'dist/demo-browser-index.json',
    entryPoints: ['demo/browser.js'],
    outfile: 'dist/demo-browser-index.js',
    external: ['fs', 'buffer', 'util'],
  },
};

// rebuild on file change
async function build(f, msg) {
  log.info('Build: file', msg, f);
  if (!es) es = await esbuild.startService();
  // common build options
  try {
    // rebuild all targets
    for (const [target, options] of Object.entries(config)) {
      await es.build({ ...common, ...options });
      log.state('Build complete:', target);
    }
    if (!module.parent) process.exit(0);
  } catch (err) {
    // catch errors and print where it occured
    log.error('Build error', JSON.stringify(err.errors || err, null, 2));
    if (!module.parent) process.exit(1);
  }
}

if (!module.parent) {
  log.header();
  build('all', 'startup');
} else {
  exports.build = build;
}
