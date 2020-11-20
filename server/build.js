#!/usr/bin/env -S node --trace-warnings

const fs = require('fs');
const esbuild = require('esbuild');
const log = require('@vladmandic/pilogger');

// keeps esbuild service instance cached
let es;
// const incremental = {};
const banner = `
  /*
  Human library
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
  */
`;

// common configuration
const common = {
  banner,
  minifyWhitespace: true,
  minifySyntax: true,
  bundle: true,
  sourcemap: true,
  // incremental: true,
  logLevel: 'error',
  target: 'es2018',
  tsconfig: 'server/tfjs-tsconfig.json',
};

const tfjs = {
  platform: 'browser',
  format: 'esm',
  metafile: 'dist/tfjs.esm.json',
  entryPoints: ['src/tf.js'],
  outfile: 'dist/tfjs.esm.js',
  external: ['fs', 'buffer', 'util'],
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

async function getStats(metafile) {
  const stats = {};
  if (!fs.existsSync(metafile)) return stats;
  const data = fs.readFileSync(metafile);
  const json = JSON.parse(data);
  if (json && json.inputs && json.outputs) {
    for (const [key, val] of Object.entries(json.inputs)) {
      if (key.startsWith('node_modules')) {
        stats.modules = (stats.modules || 0) + 1;
        stats.moduleBytes = (stats.moduleBytes || 0) + val.bytes;
      } else {
        stats.imports = (stats.imports || 0) + 1;
        stats.importBytes = (stats.importBytes || 0) + val.bytes;
      }
    }
    const files = [];
    for (const [key, val] of Object.entries(json.outputs)) {
      if (!key.endsWith('.map')) {
        // stats.outputs += 1;
        files.push(key);
        stats.outputBytes = (stats.outputBytes || 0) + val.bytes;
      }
    }
    stats.outputFiles = files.join(', ');
  }
  return stats;
}

// rebuild on file change
async function build(f, msg) {
  log.info('Build: file', msg, f, 'target:', common.target);
  if (!es) es = await esbuild.startService();
  // common build options
  try {
    // rebuild tfjs
    if (f.endsWith('tf.js') || !module.parent) {
      await es.build({ ...common, ...tfjs });
      const stats = await getStats(tfjs.metafile);
      log.state('Build:', stats);
    }
    // rebuild all targets
    for (const [target, options] of Object.entries(config)) {
      // if (!incremental.target) incremental.target = await es.build({ ...common, ...options });
      // else incremental.target.rebuild({ ...common, ...options });
      await es.build({ ...common, ...options });
      const stats = await getStats(options.metafile, target);
      log.state('Build:', stats);
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
