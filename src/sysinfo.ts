export function info() {
  let platform;
  let agent;
  if (typeof navigator !== 'undefined') {
    const raw = navigator.userAgent.match(/\(([^()]+)\)/g);
    if (raw && raw[0]) {
      // @ts-ignore
      platform = raw[0].match(/\(([^()]+)\)/g)[0].replace(/\(|\)/g, '');
      agent = navigator.userAgent.replace(raw[0], '');
      if (platform[1]) agent = agent.replace(raw[1], '');
      agent = agent.replace(/  /g, ' ');
    }
  } else if (typeof process !== 'undefined') {
    platform = `${process.platform} ${process.arch}`;
    agent = `NodeJS ${process.version}`;
  }
  return { platform, agent };
}
