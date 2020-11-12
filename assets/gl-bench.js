// downloaded from https://github.com/munrocket/gl-bench
// this file is https://github.com/munrocket/gl-bench/blob/master/dist/gl-bench.module.js

/*
var UISVG = "<div class=\"gl-box\">\n  <svg viewBox=\"0 0 55 60\">\n    <text x=\"27\" y=\"56\" class=\"gl-fps\">00 FPS</text>\n    <text x=\"28\" y=\"8\" class=\"gl-mem\"></text>\n    <rect x=\"0\" y=\"14\" rx=\"4\" ry=\"4\" width=\"55\" height=\"32\"></rect>\n    <polyline class=\"gl-chart\"></polyline>\n  </svg>\n  <svg viewBox=\"0 0 14 60\" class=\"gl-cpu-svg\">\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"opacity\"/>\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"gl-cpu\" stroke-dasharray=\"0 27\"/>\n    <path d=\"M5.35 43c-.464 0-.812.377-.812.812v1.16c-.783.1972-1.421.812-1.595 1.624h-1.16c-.435 0-.812.348-.812.812s.348.812.812.812h1.102v1.653H1.812c-.464 0-.812.377-.812.812 0 .464.377.812.812.812h1.131c.1943.783.812 1.392 1.595 1.595v1.131c0 .464.377.812.812.812.464 0 .812-.377.812-.812V53.15h1.653v1.073c0 .464.377.812.812.812.464 0 .812-.377.812-.812v-1.131c.783-.1943 1.392-.812 1.595-1.595h1.131c.464 0 .812-.377.812-.812 0-.464-.377-.812-.812-.812h-1.073V48.22h1.102c.435 0 .812-.348.812-.812s-.348-.812-.812-.812h-1.16c-.1885-.783-.812-1.421-1.595-1.624v-1.131c0-.464-.377-.812-.812-.812-.464 0-.812.377-.812.812v1.073H6.162v-1.073c0-.464-.377-.812-.812-.812zm.58 3.48h2.088c.754 0 1.363.609 1.363 1.363v2.088c0 .754-.609 1.363-1.363 1.363H5.93c-.754 0-1.363-.609-1.363-1.363v-2.088c0-.754.609-1.363 1.363-1.363z\"/>\n  </svg>\n  <svg viewBox=\"0 0 14 60\" class=\"gl-gpu-svg\">\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"opacity\"/>\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"gl-gpu\" stroke-dasharray=\"0 27\"/>\n    <path d=\"M1.94775 43.3772a.736.736 0 10-.00416 1.472c.58535.00231.56465.1288.6348.3197.07015.18975.04933.43585.04933.43585l-.00653.05405v8.671a.736.736 0 101.472 0v-1.4145c.253.09522.52785.1495.81765.1495h5.267c1.2535 0 2.254-.9752 2.254-2.185v-3.105c0-1.2075-1.00625-2.185-2.254-2.185h-5.267c-.28865 0-.5635.05405-.8165.1495.01806-.16445.04209-.598-.1357-1.0787-.22425-.6072-.9499-1.2765-2.0125-1.2765zm2.9095 3.6455c.42435 0 .7659.36225.7659.8119v2.9785c0 .44965-.34155.8119-.7659.8119s-.7659-.36225-.7659-.8119v-2.9785c0-.44965.34155-.8119.7659-.8119zm4.117 0a2.3 2.3 0 012.3 2.3 2.3 2.3 0 01-2.3 2.3 2.3 2.3 0 01-2.3-2.3 2.3 2.3 0 012.3-2.3z\"/>\n  </svg>\n</div>";

var UICSS = "#gl-bench {\n  position:absolute;\n  left:0;\n  top:0;\n  z-index:1000;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n}\n\n#gl-bench div {\n  position: relative;\n  display: block;\n  margin: 4px;\n  padding: 0 7px 0 10px;\n  background: #6c6;\n  border-radius: 15px;\n  cursor: pointer;\n  opacity: 0.9;\n}\n\n#gl-bench svg {\n  height: 60px;\n  margin: 0 -1px;\n}\n\n#gl-bench text {\n  font-size: 12px;\n  font-family: Helvetica,Arial,sans-serif;\n  font-weight: 700;\n  dominant-baseline: middle;\n  text-anchor: middle;\n}\n\n#gl-bench .gl-mem {\n  font-size: 9px;\n}\n\n#gl-bench line {\n  stroke-width: 5;\n  stroke: #112211;\n  stroke-linecap: round;\n}\n\n#gl-bench polyline {\n  fill: none;\n  stroke: #112211;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  stroke-width: 3.5;\n}\n\n#gl-bench rect {\n  fill: #448844;\n}\n\n#gl-bench .opacity {\n  stroke: #448844;\n}\n";
*/

const UISVG = `
  <div class=\"gl-box\">
    <svg viewBox=\"0 0 55 60\">
      <text x=\"27\" y=\"56\" class=\"gl-fps\">00 FPS</text>
      <text x=\"28\" y=\"8\" class=\"gl-mem\"></text>
      <rect x=\"0\" y=\"14\" rx=\"4\" ry=\"4\" width=\"55\" height=\"32\"></rect>
      <polyline class=\"gl-chart\"></polyline>
    </svg>
    <svg viewBox=\"0 0 14 60\" class=\"gl-cpu-svg\">
      <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"opacity\"/>
      <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"gl-cpu\" stroke-dasharray=\"0 27\"/>
      <path d=\"M5.35 43c-.464 0-.812.377-.812.812v1.16c-.783.1972-1.421.812-1.595 1.624h-1.16c-.435 0-.812.348-.812.812s.348.812.812.812h1.102v1.653H1.812c-.464 0-.812.377-.812.812 0 .464.377.812.812.812h1.131c.1943.783.812 1.392 1.595 1.595v1.131c0 .464.377.812.812.812.464 0 .812-.377.812-.812V53.15h1.653v1.073c0 .464.377.812.812.812.464 0 .812-.377.812-.812v-1.131c.783-.1943 1.392-.812 1.595-1.595h1.131c.464 0 .812-.377.812-.812 0-.464-.377-.812-.812-.812h-1.073V48.22h1.102c.435 0 .812-.348.812-.812s-.348-.812-.812-.812h-1.16c-.1885-.783-.812-1.421-1.595-1.624v-1.131c0-.464-.377-.812-.812-.812-.464 0-.812.377-.812.812v1.073H6.162v-1.073c0-.464-.377-.812-.812-.812zm.58 3.48h2.088c.754 0 1.363.609 1.363 1.363v2.088c0 .754-.609 1.363-1.363 1.363H5.93c-.754 0-1.363-.609-1.363-1.363v-2.088c0-.754.609-1.363 1.363-1.363z\"/>
    </svg>
    <svg viewBox=\"0 0 14 60\" class=\"gl-gpu-svg\">
      <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"opacity\"/>
      <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" class=\"gl-gpu\" stroke-dasharray=\"0 27\"/>
      <path d=\"M1.94775 43.3772a.736.736 0 10-.00416 1.472c.58535.00231.56465.1288.6348.3197.07015.18975.04933.43585.04933.43585l-.00653.05405v8.671a.736.736 0 101.472 0v-1.4145c.253.09522.52785.1495.81765.1495h5.267c1.2535 0 2.254-.9752 2.254-2.185v-3.105c0-1.2075-1.00625-2.185-2.254-2.185h-5.267c-.28865 0-.5635.05405-.8165.1495.01806-.16445.04209-.598-.1357-1.0787-.22425-.6072-.9499-1.2765-2.0125-1.2765zm2.9095 3.6455c.42435 0 .7659.36225.7659.8119v2.9785c0 .44965-.34155.8119-.7659.8119s-.7659-.36225-.7659-.8119v-2.9785c0-.44965.34155-.8119.7659-.8119zm4.117 0a2.3 2.3 0 012.3 2.3 2.3 2.3 0 01-2.3 2.3 2.3 2.3 0 01-2.3-2.3 2.3 2.3 0 012.3-2.3z\"/>
    </svg>
  </div>
  `;

const UICSS = `
  #gl-bench { position: absolute; right:0; bottom:0; z-index:1000; -webkit-user-select: none; -moz-user-select: none; user-select: none; }
  #gl-bench div { position: relative; display: block; margin: 4px; padding: 0 7px 0 10px; background: darkslategray; border-radius: 0.2rem; cursor: pointer; opacity: 0.9; }
  #gl-bench svg { height: 60px; margin: 0 -1px; }
  #gl-bench text { font-size: 12px; font-family: Helvetica,Arial,sans-serif; font-weight: 700; dominant-baseline: middle; text-anchor: middle; }
  #gl-bench .gl-mem { font-size: 9px; fill: white; }
  #gl-bench .gl-fps { font-size: 10px; fill: white; }
  #gl-bench line { stroke-width: 5; stroke: white; stroke-linecap: round; }
  #gl-bench polyline { fill: none; stroke: white; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.5; }
  #gl-bench rect { fill: black; }
  #gl-bench .opacity { stroke: black; }
  `;

class GLBench {

  /** GLBench constructor
   * @param { WebGLRenderingContext | WebGL2RenderingContext } gl context
   * @param { Object | undefined } settings additional settings
   */
  constructor(gl, settings = {}) {
    this.css = UICSS;
    this.svg = UISVG;
    this.paramLogger = () => {};
    this.chartLogger = () => {};
    this.chartLen = 20;
    this.chartHz = 20;

    this.names = [];
    this.cpuAccums = [];
    this.gpuAccums = [];  
    this.activeAccums = [];
    this.chart = new Array(this.chartLen);
    this.now = () => (performance && performance.now) ? performance.now() : Date.now();
    this.updateUI = () => {
      [].forEach.call(this.nodes['gl-gpu-svg'], node => {
        node.style.display = this.trackGPU ? 'inline' : 'none';
      });
    };

    Object.assign(this, settings);
    this.detected = 0;
    this.finished = [];
    this.isFramebuffer = 0;
    this.frameId = 0;

    // 120hz device detection
    let rafId, n = 0, t0;
    let loop = (t) => {
      if (++n < 20) {
        rafId = requestAnimationFrame(loop);
      } else {
        this.detected = Math.ceil(1e3 * n / (t - t0) / 70);
        cancelAnimationFrame(rafId);
      }
      if (!t0) t0 = t;
    };
    requestAnimationFrame(loop);

    // attach gpu profilers
    if (gl) {
      const glFinish = async (t, activeAccums) =>
        Promise.resolve(setTimeout(() => {
          gl.getError();
          const dt = this.now() - t;
          activeAccums.forEach((active, i) => {
            if (active) this.gpuAccums[i] += dt;
          });
        }, 0));

      const addProfiler = (fn, self, target) => function() {
        const t = self.now();
        fn.apply(target, arguments);
        if (self.trackGPU) self.finished.push(glFinish(t, self.activeAccums.slice(0)));
      };

      ['drawArrays', 'drawElements', 'drawArraysInstanced',
        'drawBuffers', 'drawElementsInstanced', 'drawRangeElements']
        .forEach(fn => { if (gl[fn]) gl[fn] = addProfiler(gl[fn], this, gl); });

      gl.getExtension = ((fn, self) => function() {
        let ext = fn.apply(gl, arguments);
        if (ext) {
          ['drawElementsInstancedANGLE', 'drawBuffersWEBGL']
            .forEach(fn => { if (ext[fn]) ext[fn] = addProfiler(ext[fn], self, ext); });
        }
        return ext;
      })(gl.getExtension, this);
    }

    // init ui and ui loggers
    if (!this.withoutUI) {
      if (!this.dom) this.dom = document.body;
      let elm = document.createElement('div');
      elm.id = 'gl-bench';
      this.dom.appendChild(elm);
      this.dom.insertAdjacentHTML('afterbegin', '<style id="gl-bench-style">' + this.css + '</style>');
      this.dom = elm;
      this.dom.addEventListener('click', () => {
        this.trackGPU = !this.trackGPU;
        this.updateUI();
      });

      this.paramLogger = ((logger, dom, names) => {
        const classes = ['gl-cpu', 'gl-gpu', 'gl-mem', 'gl-fps', 'gl-gpu-svg', 'gl-chart'];
        const nodes = Object.assign({}, classes);
        classes.forEach(c => nodes[c] = dom.getElementsByClassName(c));
        this.nodes = nodes;
        return (i, cpu, gpu, mem, fps, totalTime, frameId) => {
          nodes['gl-cpu'][i].style.strokeDasharray = (cpu * 0.27).toFixed(0) + ' 100';
          nodes['gl-gpu'][i].style.strokeDasharray = (gpu * 0.27).toFixed(0) + ' 100';
          nodes['gl-mem'][i].innerHTML = names[i] ? names[i] : (mem ? 'mem: ' + mem.toFixed(0) + 'mb' : '');
          nodes['gl-fps'][i].innerHTML = fps.toFixed(0) + ' FPS';
          logger(names[i], cpu, gpu, mem, fps, totalTime, frameId);
        }
      })(this.paramLogger, this.dom, this.names);

      this.chartLogger = ((logger, dom) => {
        let nodes = { 'gl-chart': dom.getElementsByClassName('gl-chart') };
        return (i, chart, circularId) => {
          let points = '';
          let len = chart.length;
          for (let i = 0; i < len; i++) {
            let id = (circularId + i + 1) % len;
            if (chart[id] != undefined) {
              points = points + ' ' + (55 * i / (len - 1)).toFixed(1) + ','
                + (45 - chart[id] * 22 / 60 / this.detected).toFixed(1);
            }
          }
          nodes['gl-chart'][i].setAttribute('points', points);
          logger(this.names[i], chart, circularId);
        }
      })(this.chartLogger, this.dom);
    }
  }

  /**
   * Explicit UI add
   * @param { string | undefined } name 
   */
  addUI(name) {
    if (this.names.indexOf(name) == -1) {
      this.names.push(name);
      if (this.dom) {
        this.dom.insertAdjacentHTML('beforeend', this.svg);
        this.updateUI();
      }
      this.cpuAccums.push(0);
      this.gpuAccums.push(0);
      this.activeAccums.push(false);
    }
  }

  /**
   * Increase frameID
   * @param { number | undefined } now
   */
  nextFrame(now) {
    this.frameId++;
    const t = now ? now : this.now();

    // params
    if (this.frameId <= 1) {
      this.paramFrame = this.frameId;
      this.paramTime = t;
    } else {
      let duration = t - this.paramTime;
      if (duration >= 1e3) {
        const frameCount = this.frameId - this.paramFrame;
        const fps = frameCount / duration * 1e3;
        for (let i = 0; i < this.names.length; i++) {
          const cpu = this.cpuAccums[i] / duration * 100,
            gpu = this.gpuAccums[i] / duration * 100,
            mem = (performance && performance.memory) ? performance.memory.usedJSHeapSize / (1 << 20) : 0;
          this.paramLogger(i, cpu, gpu, mem, fps, duration, frameCount);
          this.cpuAccums[i] = 0;
          Promise.all(this.finished).then(() => {
            this.gpuAccums[i] = 0;
            this.finished = [];
          });
        }
        this.paramFrame = this.frameId;
        this.paramTime = t;
      }
    }

    // chart
    if (!this.detected || !this.chartFrame) {
      this.chartFrame = this.frameId;
      this.chartTime = t;
      this.circularId = 0;
    } else {
      let timespan = t - this.chartTime;
      let hz = this.chartHz * timespan / 1e3;
      while (--hz > 0 && this.detected) {
        const frameCount = this.frameId - this.chartFrame;
        const fps = frameCount / timespan * 1e3;
        this.chart[this.circularId % this.chartLen] = fps;
        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger(i, this.chart, this.circularId);
        }
        this.circularId++;
        this.chartFrame = this.frameId;
        this.chartTime = t;
      }
    }
  }

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name) {
    this.updateAccums(name);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name) {
    this.updateAccums(name);
  }

  updateAccums(name) {
    let nameId = this.names.indexOf(name);
    if (nameId == -1) {
      nameId = this.names.length;
      this.addUI(name);
    }

    const t = this.now();
    const dt = t - this.t0;
    for (let i = 0; i < nameId + 1; i++) {
      if (this.activeAccums[i]) {
        this.cpuAccums[i] += dt;
      }
    }    this.activeAccums[nameId] = !this.activeAccums[nameId];
    this.t0 = t;
  }

}

export default GLBench;
