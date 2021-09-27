/**
 * Simple helper functions used accross codebase
 */

// helper function: join two paths
export function join(folder: string, file: string): string {
  const separator = folder.endsWith('/') ? '' : '/';
  const skipJoin = file.startsWith('.') || file.startsWith('/') || file.startsWith('http:') || file.startsWith('https:') || file.startsWith('file:');
  const path = skipJoin ? `${file}` : `${folder}${separator}${file}`;
  if (!path.toLocaleLowerCase().includes('.json')) throw new Error(`modelpath error: ${path} expecting json file`);
  return path;
}

// helper function: wrapper around console output
export function log(...msg): void {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  if (msg) console.log(ts, 'Human:', ...msg);
}

// helper function: gets elapsed time on both browser and nodejs
export const now = () => {
  if (typeof performance !== 'undefined') return performance.now();
  return parseInt((Number(process.hrtime.bigint()) / 1000 / 1000).toString());
};

// helper function: checks current config validity
export function validate(defaults, config, parent = 'config', msgs: Array<{ reason: string, where: string, expected?: string }> = []) {
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

// helper function: perform deep merge of multiple objects so it allows full inheriance with overrides
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
export async function wait(time) {
  const waiting = new Promise((resolve) => setTimeout(() => resolve(true), time));
  await waiting;
}

// helper function: find box around keypoints, square it and scale it
export function scaleBox(keypoints, boxScaleFact, outputSize) {
  const coords = [keypoints.map((pt) => pt[0]), keypoints.map((pt) => pt[1])]; // all x/y coords
  const maxmin = [Math.max(...coords[0]), Math.min(...coords[0]), Math.max(...coords[1]), Math.min(...coords[1])]; // find min/max x/y coordinates
  const center = [(maxmin[0] + maxmin[1]) / 2, (maxmin[2] + maxmin[3]) / 2]; // find center x and y coord of all fingers
  const diff = Math.max(center[0] - maxmin[1], center[1] - maxmin[3], -center[0] + maxmin[0], -center[1] + maxmin[2]) * boxScaleFact; // largest distance from center in any direction
  const box = [
    Math.trunc(center[0] - diff),
    Math.trunc(center[1] - diff),
    Math.trunc(2 * diff),
    Math.trunc(2 * diff),
  ] as [number, number, number, number];
  const boxRaw = [ // work backwards
    box[0] / outputSize[0],
    box[1] / outputSize[1],
    box[2] / outputSize[0],
    box[3] / outputSize[1],
  ] as [number, number, number, number];
  const yxBox = [ // work backwards
    boxRaw[1],
    boxRaw[0],
    boxRaw[3] + boxRaw[1],
    boxRaw[2] + boxRaw[0],
  ] as [number, number, number, number];
  return { box, boxRaw, yxBox };
}
