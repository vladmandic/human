const ts = require('typescript');
const log = require('@vladmandic/pilogger');

const version = ts.version;

async function typings(entryPoint) {
  const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json') || '';
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');
  log.info('Generate Typings:', entryPoint, 'outDir:', [compilerOptions.options.outDir]);
  const compilerHost = ts.createCompilerHost(compilerOptions.options);
  const program = ts.createProgram(entryPoint, compilerOptions.options, compilerHost);
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

if (require.main === module) {
  log.header();
  typings(['src/human.ts']); // generate typedoc
} else {
  exports.run = typings;
  exports.version = version;
}
