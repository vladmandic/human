/**
 * Implements Human build process
 * Used to generate prod builds for releases or by dev server to generate on-the-fly debug builds
 */

const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const esbuild = require('esbuild');
const rimraf = require('rimraf');
const tfjs = require('@tensorflow/tfjs/package.json');
const changelog = require('./changelog.js');
const lint = require('./lint.js');
const typedoc = require('./typedoc.js');
const typings = require('./typings.js');

let busy = false;

const config = {
  build: {
    banner: { js: `
    /*
      Human library
      homepage: <https://github.com/vladmandic/human>
      author: <https://github.com/vladmandic>'
    */` },
    tsconfig: './tsconfig.json',
    logLevel: 'error',
    bundle: true,
    metafile: true,
    target: 'es2018',
  },
  debug: {
    minifyWhitespace: false,
    minifyIdentifiers: false,
    minifySyntax: false,
  },
  production: {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
  buildLog: 'build.log',
  changelog: '../CHANGELOG.md',
  lintLocations: ['server/', 'src/', 'tfjs/', 'test/', 'demo/'],
  cleanLocations: ['dist/*', 'types/*', 'typedoc/*'],
};

const targets = {
  node: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['tfjs/tf-node.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
    node: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.node.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
  },
  nodeGPU: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['tfjs/tf-node-gpu.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
    node: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.node-gpu.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
  },
  nodeWASM: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['tfjs/tf-node-wasm.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
    node: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.node-wasm.js',
      external: ['@tensorflow'],
      sourcemap: false,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
  },

  browserNoBundle: {
    tfjs: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['tfjs/tf-browser.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['fs', 'buffer', 'util', 'os', '@tensorflow'],
      sourcemap: true,
    },
    esm: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.esm-nobundle.js',
      external: ['fs', 'buffer', 'util', 'os', '@tensorflow'],
      sourcemap: true,
    },
  },
  browserBundle: {
    tfjs: {
      banner: { js: '/* TFJS custom ESM bundle in ES2018 */' },
      platform: 'browser',
      format: 'esm',
      entryPoints: ['tfjs/tf-browser.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['fs', 'buffer', 'util', 'os'],
      treeShaking: 'ignore-annotations',
      sourcemap: true,
      minifyWhitespace: false,
      minifyIdentifiers: false,
      minifySyntax: false,
    },
    iife: {
      platform: 'browser',
      format: 'iife',
      globalName: 'Human',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.js',
      external: ['fs', 'buffer', 'util', 'os'],
      sourcemap: false,
    },
    esm: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.esm.js',
      external: ['fs', 'buffer', 'util', 'os'],
      sourcemap: true,
    },
    /*
     demo: {
       platform: 'browser',
       format: 'esm',
       entryPoints: ['demo/browser.js'],
       outfile: 'dist/demo-browser-index.js',
       external: ['fs', 'buffer', 'util', 'os'],
     },
     */
  },
};

async function getStats(json) {
  const stats = {};
  if (json && json.metafile?.inputs && json.metafile?.outputs) {
    for (const [key, val] of Object.entries(json.metafile.inputs)) {
      if (key.startsWith('node_modules')) {
        stats.modules = (stats.modules || 0) + 1;
        stats.moduleBytes = (stats.moduleBytes || 0) + val.bytes;
      } else {
        stats.imports = (stats.imports || 0) + 1;
        stats.importBytes = (stats.importBytes || 0) + val.bytes;
      }
    }
    const files = [];
    for (const [key, val] of Object.entries(json.metafile.outputs)) {
      if (!key.endsWith('.map')) {
        files.push(key);
        stats.outputBytes = (stats.outputBytes || 0) + val.bytes;
      }
    }
    stats.outputFiles = files.join(', ');
  }
  return stats;
}

// rebuild typings

// rebuild on file change
async function build(f, msg, dev = false) {
  if (busy) {
    log.state('Build: busy...');
    setTimeout(() => build(f, msg, dev), 500);
    return;
  }
  busy = true;
  log.info('Build: file', msg, f, 'type:', dev ? 'debug' : 'production', 'config:', dev ? config.debug : config.production);
  // common build options
  try {
    // rebuild all target groups and types
    for (const [targetGroupName, targetGroup] of Object.entries(targets)) {
      for (const [targetName, targetOptions] of Object.entries(targetGroup)) {
        // if triggered from watch mode, rebuild only browser bundle
        // if ((require.main !== module) && ((targetGroupName === 'browserNoBundle') || (targetGroupName === 'nodeGPU'))) continue;
        const opt = dev ? config.debug : config.production;
        // @ts-ignore // eslint-typescript complains about string enums used in js code
        const meta = await esbuild.build({ ...config.build, ...opt, ...targetOptions });
        const stats = await getStats(meta);
        log.state(` target: ${targetGroupName} type: ${targetName}:`, stats);
      }
    }
    if (!dev) { // only for prod builds, skipped for dev build
      await lint.run(config.lintLocations); // run linter
      await changelog.update(config.changelog); // generate changelog
      await typings.run(targets.browserBundle.esm.entryPoints); // generate typings
      await typedoc.run(targets.browserBundle.esm.entryPoints); // generate typedoc
    }
    if (require.main === module) process.exit(0);
  } catch (err) {
    // catch errors and print where it occured
    log.error('Build error', JSON.stringify(err.errors || err, null, 2));
    if (require.main === module) process.exit(1);
  }
  busy = false;
}

function clean() {
  log.info('Clean:', config.cleanLocations);
  for (const loc of config.cleanLocations) rimraf.sync(loc);
}

if (require.main === module) {
  config.buildLog = path.join(__dirname, config.buildLog);
  if (fs.existsSync(config.buildLog)) fs.unlinkSync(config.buildLog);
  log.logFile(config.buildLog);
  log.header();
  const toolchain = {
    tfjs: tfjs.version,
    esbuild: esbuild.version,
    typescript: typings.version,
    typedoc: typedoc.version,
    eslint: lint.version,
  };
  log.info('Toolchain: ', toolchain);
  clean();
  build('all', 'startup');
} else {
  exports.build = build;
}
