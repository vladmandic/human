/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

import{Human as p}from"../../dist/human.esm.js";var w={async:!0,modelBasePath:"../../models",filter:{enabled:!0,equalization:!1,flip:!1},face:{enabled:!0,detector:{rotation:!1},mesh:{enabled:!0},attention:{enabled:!1},iris:{enabled:!0},description:{enabled:!0},emotion:{enabled:!0}},body:{enabled:!0},hand:{enabled:!0},object:{enabled:!1},gesture:{enabled:!0}},t=new p(w);t.env.perfadd=!1;t.draw.options.font='small-caps 18px "Lato"';t.draw.options.lineHeight=20;var e={video:document.getElementById("video"),canvas:document.getElementById("canvas"),log:document.getElementById("log"),fps:document.getElementById("status"),perf:document.getElementById("performance")},o={detect:0,draw:0,tensors:0},d={detect:0,draw:0},s=(...a)=>{e.log.innerText+=a.join(" ")+`
`,console.log(...a)},r=a=>e.fps.innerText=a,b=a=>e.perf.innerText="tensors:"+t.tf.memory().numTensors+" | performance: "+JSON.stringify(a).replace(/"|{|}/g,"").replace(/,/g," | ");async function h(){r("starting webcam...");let a={audio:!1,video:{facingMode:"user",resizeMode:"none",width:{ideal:document.body.clientWidth},height:{ideal:document.body.clientHeight}}},n=await navigator.mediaDevices.getUserMedia(a),m=new Promise(u=>{e.video.onloadeddata=()=>u(!0)});e.video.srcObject=n,e.video.play(),await m,e.canvas.width=e.video.videoWidth,e.canvas.height=e.video.videoHeight;let i=n.getVideoTracks()[0],f=i.getCapabilities?i.getCapabilities():"",v=i.getSettings?i.getSettings():"",g=i.getConstraints?i.getConstraints():"";s("video:",e.video.videoWidth,e.video.videoHeight,i.label,{stream:n,track:i,settings:v,constraints:g,capabilities:f}),e.canvas.onclick=()=>{e.video.paused?e.video.play():e.video.pause()}}async function c(){if(!e.video.paused){await t.detect(e.video);let n=t.tf.memory().numTensors;n-o.tensors!==0&&s("allocated tensors:",n-o.tensors),o.tensors=n}let a=t.now();d.detect=1e3/(a-o.detect),o.detect=a,requestAnimationFrame(c)}async function l(){if(!e.video.paused){let n=await t.next(t.result);t.config.filter.flip?await t.draw.canvas(n.canvas,e.canvas):await t.draw.canvas(e.video,e.canvas),await t.draw.all(e.canvas,n),b(n.performance)}let a=t.now();d.draw=1e3/(a-o.draw),o.draw=a,r(e.video.paused?"paused":`fps: ${d.detect.toFixed(1).padStart(5," ")} detect | ${d.draw.toFixed(1).padStart(5," ")} draw`),setTimeout(l,30)}async function y(){s("human version:",t.version,"| tfjs version:",t.tf.version["tfjs-core"]),s("platform:",t.env.platform,"| agent:",t.env.agent),r("loading..."),await t.load(),s("backend:",t.tf.getBackend(),"| available:",t.env.backends),s("models stats:",t.getModelStats()),s("models loaded:",Object.values(t.models).filter(a=>a!==null).length),r("initializing..."),await t.warmup(),await h(),await c(),await l()}window.onload=y;
/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */
//# sourceMappingURL=index.js.map
