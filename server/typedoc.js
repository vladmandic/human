const log = require('@vladmandic/pilogger');
const TypeDoc = require('typedoc');
const tsconfig = require('../tsconfig.json');

let td = null;

const version = TypeDoc.Application.VERSION;

async function typedoc(entryPoints) {
  if (!td) {
    td = new TypeDoc.Application();
    td.options.addReader(new TypeDoc.TSConfigReader());
    td.bootstrap({ entryPoints });
    td.logger.warn = log.warn;
    td.logger.error = log.error;
    td.logger.verbose = () => { /***/ };
    // td.logger.verbose = log.data; // remove extra logging
    td.logger.log = log.info;
    // td.converter = converter;
  }
  log.info('Generate TypeDocs:', entryPoints, 'outDir:', [tsconfig.typedocOptions.out]);
  const project = td.convert();
  if (!project) log.warn('TypeDoc: convert returned empty project');
  if (td.logger.hasErrors() || td.logger.hasWarnings()) log.warn('TypeDoc:', 'errors:', td.logger.errorCount, 'warnings:', td.logger.warningCount);
  const result = project ? await td.generateDocs(project, 'typedoc') : null;
  if (result) log.warn('TypeDoc:', result);
}

if (require.main === module) {
  log.header();
  typedoc(['src/human.ts']); // generate typedoc
} else {
  exports.run = typedoc;
  exports.version = version;
}
