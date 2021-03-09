#!/usr/bin/env -S node --trace-warnings

const log = require('@vladmandic/pilogger');
const esbuild = require('esbuild');
const ts = require('typescript');

// keeps esbuild service instance cached
let busy = false;
const banner = { js: `
  /*
  Human library
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
  */
` };

// tsc configuration for building types only
const tsconfig = {
  noEmitOnError: false,
  target: ts.ScriptTarget.ES2018,
  module: ts.ModuleKind.ES2020,
  outDir: 'types/',
  declaration: true,
  emitDeclarationOnly: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  skipLibCheck: true,
  importHelpers: true,
  noImplicitAny: false,
  preserveConstEnums: true,
  strictNullChecks: true,
  baseUrl: './',
  typeRoots: ['node_modules/@types'],
  paths: {
    tslib: ['node_modules/tslib/tslib.d.ts'],
    '@tensorflow/tfjs-node/dist/io/file_system': ['node_modules/@tensorflow/tfjs-node/dist/io/file_system.js'],
  },
};

// common configuration
const config = {
  common: {
    banner,
    tsconfig: 'server/tfjs-tsconfig.json',
    bundle: true,
    logLevel: 'error',
    metafile: true,
  },
  debug: {
    minifyWhitespace: false,
    minifyIdentifiers: false,
    minifySyntax: false,
    sourcemap: true,
    target: 'es2018',
  },
  production: {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    sourcemap: true,
    target: 'es2018',
  },
};

const targets = {
  node: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/tfjs/tf-node.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['@tensorflow'],
    },
    node: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.node.js',
      external: ['@tensorflow'],
    },
  },
  nodeGPU: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/tfjs/tf-node-gpu.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['@tensorflow'],
    },
    node: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.node-gpu.js',
      external: ['@tensorflow'],
    },
  },

  browserNoBundle: {
    tfjs: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/tfjs/tf-browser.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['fs', 'buffer', 'util', 'os', '@tensorflow'],
    },
    esm: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.esm-nobundle.js',
      external: ['fs', 'buffer', 'util', 'os', '@tensorflow'],
    },
  },
  browserBundle: {
    tfjs: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/tfjs/tf-browser.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['fs', 'buffer', 'util', 'os'],
    },
    iife: {
      platform: 'browser',
      format: 'iife',
      globalName: 'Human',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.js',
      external: ['fs', 'buffer', 'util', 'os'],
    },
    esm: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/human.ts'],
      outfile: 'dist/human.esm.js',
      external: ['fs', 'buffer', 'util', 'os'],
    },
    demo: {
      platform: 'browser',
      format: 'esm',
      entryPoints: ['demo/browser.js'],
      outfile: 'dist/demo-browser-index.js',
      external: ['fs', 'buffer', 'util', 'os'],
    },
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
function compile(fileNames, options) {
  log.info('Compile typings:', fileNames);
  const program = ts.createProgram(fileNames, options);
  const emit = program.emit();
  const diag = ts
    .getPreEmitDiagnostics(program)
    .concat(emit.diagnostics);
  for (const info of diag) {
    // @ts-ignore
    const msg = info.messageText.messageText || info.messageText;
    if (msg.includes('package.json')) continue;
    if (msg.includes('Expected 0 arguments, but got 1')) continue;
    if (info.file) {
      const pos = info.file.getLineAndCharacterOfPosition(info.start || 0);
      log.error(`TSC: ${info.file.fileName} [${pos.line + 1},${pos.character + 1}]:`, msg);
    } else {
      log.error('TSC:', msg);
    }
  }
}

// rebuild on file change
async function build(f, msg, dev = false) {
  if (busy) {
    log.state('Build: busy...');
    setTimeout(() => build(f, msg), 500);
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
        // if ((require.main !== module) && (targetGroupName !== 'browserBundle')) continue;
        const meta = dev
          // @ts-ignore
          ? await esbuild.build({ ...config.common, ...config.debug, ...targetOptions })
          // @ts-ignore
          : await esbuild.build({ ...config.common, ...config.production, ...targetOptions });
        const stats = await getStats(meta);
        log.state(`Build for: ${targetGroupName} type: ${targetName}:`, stats);
      }
    }
    // generate typings
    compile(targets.browserBundle.esm.entryPoints, tsconfig);
    if (require.main === module) process.exit(0);
  } catch (err) {
    // catch errors and print where it occured
    log.error('Build error', JSON.stringify(err.errors || err, null, 2));
    if (require.main === module) process.exit(1);
  }
  busy = false;
}

if (require.main === module) {
  log.header();
  build('all', 'startup');
} else {
  exports.build = build;
}
