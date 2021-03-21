// helper function: wrapper around console output
export function log(...msg) {
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
