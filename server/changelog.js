const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const simpleGit = require('simple-git/promise');
const logger = require('@vladmandic/pilogger');
const app = require('../package.json');

const git = simpleGit();

let text = `
# ${app.name}  

Version: **${app.version}**  
Description: **${app.description}**  

Author: **${app.author}**  
License: **${app.license}** </LICENSE>  
Repository: **<${app.repository.url}>**  

## Changelog
`;

async function update(f) {
  const all = await git.log();
  // @ts-ignore
  const log = all.all.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  let previous = '';
  for (const l of log) {
    const msg = l.message.toLowerCase();
    if ((l.refs !== '') || msg.match(/^[0-9].[0-9].[0-9]/)) {
      const dt = dayjs(l.date).format('YYYY/MM/DD');
      const ver = msg.match(/[0-9].[0-9].[0-9]/) ? msg : l.refs;
      text += `\n### **${ver}** ${dt} ${l.author_email}\n`;
    } else if ((msg.length > 2) && !msg.startsWith('update') && (previous !== msg)) {
      previous = msg;
      text += `- ${msg}\n`;
    }
  }

  const name = path.join(__dirname, f);
  fs.writeFileSync(name, text);
  logger.state('Change log updated:', name);
}

exports.update = update;

try {
  if (require.main === module) {
    update('../wiki/Change-Log.md');
  }
} catch {
  //
}
