const log = require('@vladmandic/pilogger');
const TypeDoc = require('typedoc');
const tsconfig = require('../tsconfig.json');

let td = null;

const version = TypeDoc.Application.VERSION;

async function typedoc(entryPoint) {
  if (!td) {
    td = new TypeDoc.Application();
    td.options.addReader(new TypeDoc.TSConfigReader());
    td.bootstrap({ entryPoints: [entryPoint], theme: 'wiki/theme/' });
    td.logger.warn = log.warn;
    td.logger.error = log.error;
    td.logger.verbose = () => { /***/ };
    td.logger.log = log.info;
  }
  log.info('Generate TypeDocs:', entryPoint, 'outDir:', [tsconfig.typedocOptions.out]);
  const project = td.convert();
  if (!project) log.warn('TypeDoc: convert returned empty project');
  if (td.logger.hasErrors() || td.logger.hasWarnings()) log.warn('TypeDoc:', 'errors:', td.logger.errorCount, 'warnings:', td.logger.warningCount);
  const result = project ? await td.generateDocs(project, 'typedoc') : null;
  if (result) log.warn('TypeDoc:', result);
}

exports.run = typedoc;
exports.version = version;
