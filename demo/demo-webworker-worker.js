import human from '../dist/human.esm.js';

onmessage = async (msg) => {
  const result = await human.detect(msg.data.image, msg.data.config);
  postMessage(result);
};

/*

web workers are finicky
- cannot pass HTMLImage or HTMLVideo to web worker, so need to pass canvas instead
- canvases can execute transferControlToOffscreen() and then become offscreenCanvas which can be passed to worker, but...
  cannot transfer canvas that has a rendering context (basically, first time you execute getContext() on it)

which means that if we pass main Canvas that will be used to render results on,
then all operations on it must be within webworker and we cannot touch it in the main thread at all.
doable, but...how to paint a video frame on it before we pass it?

and we create new offscreenCanvas that we drew video frame on and pass it's imageData and return results from worker
then there is an overhead of creating it and it ends up being slower than executing in the main thread

*/
