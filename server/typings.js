const ts = require('typescript');
const log = require('@vladmandic/pilogger');
const tsconfig = require('../tsconfig.json');

const version = ts.version;

async function typings(entryPoint) {
  log.info('Generate Typings:', entryPoint, 'outDir:', [tsconfig.compilerOptions.outDir]);
  const tsoptions = { ...tsconfig.compilerOptions,
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
  };
  const compilerHost = ts.createCompilerHost(tsoptions);
  const program = ts.createProgram(entryPoint, tsoptions, compilerHost);
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

exports.run = typings;
exports.version = version;
