const log = require('@vladmandic/pilogger');

let eslint = null;
const { ESLint } = require('eslint');

const version = ESLint.version;

async function lint(lintLocations) {
  log.info('Running Linter:', lintLocations);
  if (!eslint) eslint = new ESLint();
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

exports.run = lint;
exports.version = version;
