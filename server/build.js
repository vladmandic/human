/**
 * Implements Human build process
 * Used to generate prod builds for releases or by dev server to generate on-the-fly debug builds
 */

const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const esbuild = require('esbuild');
const TypeDoc = require('typedoc');
const { ESLint } = require('eslint');
const tfjs = require('@tensorflow/tfjs/package.json');
const changelog = require('./changelog');

let logFile = 'build.log';

let busy = false;
let td = null;
let eslint = null;
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
  outDir: 'types',
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
    '@tensorflow/tfjs-core/dist/index': ['node_modules/@tensorflow/tfjs-core/dist/index.js'],
    '@tensorflow/tfjs-converter/dist/index': ['node_modules/@tensorflow/tfjs-converter/dist/index.js'],
  },
};

// common configuration
const lintLocations = ['server/', 'demo/', 'src/', 'test/'];

const config = {
  common: {
    banner,
    tsconfig: 'server/tfjs-tsconfig.json',
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
};

const targets = {
  node: {
    tfjs: {
      platform: 'node',
      format: 'cjs',
      entryPoints: ['src/tfjs/tf-node.ts'],
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
      entryPoints: ['src/tfjs/tf-node-gpu.ts'],
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
      entryPoints: ['src/tfjs/tf-node-wasm.ts'],
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
      entryPoints: ['src/tfjs/tf-browser.ts'],
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
      platform: 'browser',
      format: 'esm',
      entryPoints: ['src/tfjs/tf-browser.ts'],
      outfile: 'dist/tfjs.esm.js',
      external: ['fs', 'buffer', 'util', 'os'],
      sourcemap: true,
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
async function typings(entryPoint, options) {
  log.info('Generate types:', entryPoint);
  const program = ts.createProgram(entryPoint, options);
  const emit = program.emit();
  const diag = ts
    .getPreEmitDiagnostics(program)
    .concat(emit.diagnostics);
  for (const info of diag) {
    const msg = info.messageText['messageText'] || info.messageText;
    if (msg.includes('package.json')) continue;
    if (info.file) {
      const pos = info.file.getLineAndCharacterOfPosition(info.start || 0);
      log.error(`TSC: ${info.file.fileName} [${pos.line + 1},${pos.character + 1}]:`, msg);
    } else {
      log.error('TSC:', msg);
    }
  }
}

async function typedoc(entryPoint) {
  log.info('Generate TypeDocs:', entryPoint);
  if (!td) {
    td = new TypeDoc.Application();
    td.options.addReader(new TypeDoc.TSConfigReader());
    td.bootstrap({ entryPoints: [entryPoint], theme: 'wiki/theme/' });
    td.logger.warn = log.warn;
    td.logger.error = log.error;
    td.logger.verbose = () => { /***/ };
    td.logger.log = log.info;
  }
  const project = td.convert();
  if (!project) log.warn('TypeDoc: convert returned empty project');
  if (td.logger.hasErrors() || td.logger.hasWarnings()) log.warn('TypeDoc:', 'errors:', td.logger.errorCount, 'warnings:', td.logger.warningCount);
  const result = project ? await td.generateDocs(project, 'typedoc') : null;
  if (result) log.warn('TypeDoc:', result);
}

async function lint() {
  log.info('Running Linter:', lintLocations);
  if (!eslint) {
    eslint = new ESLint();
  }
  const results = await eslint.lintFiles(lintLocations);
  const errors = results.reduce((prev, curr) => prev += curr.errorCount, 0);
  const warnings = results.reduce((prev, curr) => prev += curr.warningCount, 0);
  log.info('Linter complete: files:', results.length, 'errors:', errors, 'warnings:', warnings);
  if (errors > 0 || warnings > 0) {
    const formatter = await eslint.loadFormatter('stylish');
    const text = formatter.format(results);
    log.warn(text);
  }
}

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
        const meta = dev
          // @ts-ignore // eslint-typescript complains about string enums used in js code
          ? await esbuild.build({ ...config.common, ...config.debug, ...targetOptions })
          // @ts-ignore // eslint-typescript complains about string enums used in js code
          : await esbuild.build({ ...config.common, ...config.production, ...targetOptions });
        const stats = await getStats(meta);
        log.state(`Build for: ${targetGroupName} type: ${targetName}:`, stats);
      }
    }
    if (!dev) { // only for prod builds, skipped for dev build
      await lint(); // run linter
      await typings(targets.browserBundle.esm.entryPoints, tsconfig); // generate typings
      await changelog.update('../CHANGELOG.md'); // generate changelog
      await typedoc(targets.browserBundle.esm.entryPoints); // generate typedoc
    }
    if (require.main === module) process.exit(0);
  } catch (err) {
    // catch errors and print where it occured
    log.error('Build error', JSON.stringify(err.errors || err, null, 2));
    if (require.main === module) process.exit(1);
  }
  busy = false;
}

if (require.main === module) {
  logFile = path.join(__dirname, logFile);
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log.logFile(logFile);
  log.header();
  log.info(`Toolchain: tfjs: ${tfjs.version} esbuild ${esbuild.version}; typescript ${ts.version}; typedoc: ${TypeDoc.Application.VERSION} eslint: ${ESLint.version}`);
  build('all', 'startup');
} else {
  exports.build = build;
}
