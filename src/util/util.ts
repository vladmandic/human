import type { Config } from '../exports';

/**
 * Simple helper functions used accross codebase
 */

// helper function: wrapper around console output
export function log(...msg): void {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  if (msg) console.log(ts, 'Human:', ...msg);
}

// helper function: join two paths
export function join(folder: string, file: string): string {
  const separator = folder.endsWith('/') ? '' : '/';
  const skipJoin = file.startsWith('.') || file.startsWith('/') || file.startsWith('http:') || file.startsWith('https:') || file.startsWith('file:');
  const path = skipJoin ? `${file}` : `${folder}${separator}${file}`;
  if (!path.toLocaleLowerCase().includes('.json')) throw new Error(`modelpath error: expecting json file: ${path}`);
  return path;
}

// helper function: gets elapsed time on both browser and nodejs
export const now = () => {
  if (typeof performance !== 'undefined') return performance.now();
  return parseInt((Number(process.hrtime.bigint()) / 1000 / 1000).toString());
};

// helper function: checks current config validity
export function validate(defaults: Partial<Config>, config: Partial<Config>, parent = 'config', msgs: Array<{ reason: string, where: string, expected?: string }> = []) {
  for (const key of Object.keys(config)) {
    if (typeof config[key] === 'object') {
      validate(defaults[key], config[key], key, msgs);
    } else {
      const defined = defaults && (typeof defaults[key] !== 'undefined');
      if (!defined) msgs.push({ reason: 'unknown property', where: `${parent}.${key} = ${config[key]}` });
      const same = defaults && typeof defaults[key] === typeof config[key];
      if (defined && !same) msgs.push({ reason: 'property type mismatch', where: `${parent}.${key} = ${config[key]}`, expected: typeof defaults[key] });
    }
    // ok = ok && defined && same;
  }
  if (config.debug && parent === 'config' && msgs.length > 0) log('invalid configuration', msgs);
  return msgs;
}

// helper function: perform deep merge of multiple objects so it allows full inheritance with overrides
export function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';
  return objects.reduce((prev, obj) => {
    Object.keys(obj || {}).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];
      if (Array.isArray(pVal) && Array.isArray(oVal)) prev[key] = pVal.concat(...oVal);
      else if (isObject(pVal) && isObject(oVal)) prev[key] = mergeDeep(pVal, oVal);
      else prev[key] = oVal;
    });
    return prev;
  }, {});
}

// helper function: return min and max from input array
export const minmax = (data: Array<number>) => data.reduce((acc: Array<number>, val) => {
  acc[0] = (acc[0] === undefined || val < acc[0]) ? val : acc[0];
  acc[1] = (acc[1] === undefined || val > acc[1]) ? val : acc[1];
  return acc;
}, []);

// helper function: async wait
export async function wait(time: number) {
  const waiting = new Promise((resolve) => { setTimeout(() => resolve(true), time); });
  await waiting;
}
