const css = `
  .menu-container { display: block; background: darkslategray; position: fixed; top: 0rem; right: 0; width: fit-content; padding: 0 0.8rem 0 0.8rem; line-height: 1.8rem; z-index: 10; max-height: calc(100% - 4rem); box-shadow: 0 0 8px dimgrey; }
  .menu-container:hover { box-shadow: 0 0 8px lightgrey; }
  .menu { display: flex; white-space: nowrap; background: darkslategray; padding: 0.2rem; width: max-content; }
  .menu-title { text-align: right; cursor: pointer; }
  .menu-hr { margin: 0.2rem; border: 1px solid rgba(0, 0, 0, 0.5) }
  .menu-label { padding: 0; }

  .menu-chart-title { align-items: center; }
  .menu-chart-canvas { background: transparent; height: 40px; width: 180px; margin: 0.2rem 0.2rem 0.2rem 1rem; }
  
  .menu-button { border: 0; background: lightblue; width: -webkit-fill-available; padding: 8px; margin: 8px 0 8px 0; cursor: pointer; box-shadow: 4px 4px 4px 0 dimgrey; }
  .menu-button:hover { background: lightgreen; box-shadow: 4px 4px 4px 0 black; }
  .menu-button:focus { outline: none; }

  .menu-checkbox { width: 2.8rem; height: 1rem; background: black; margin: 0.5rem 0.8rem 0 0; position: relative; border-radius: 1rem; }
  .menu-checkbox:after { content: 'OFF'; color: lightcoral; position: absolute; right: 0.2rem; top: -0.4rem; font-weight: 800; font-size: 0.5rem; }
  .menu-checkbox:before { content: 'ON'; color: lightgreen; position: absolute; left: 0.3rem; top: -0.4rem; font-weight: 800; font-size: 0.5rem; }
  .menu-checkbox-label { width: 1.3rem; height: 0.8rem; cursor: pointer; position: absolute; top: 0.1rem; left: 0.1rem; z-index: 1; background: lightcoral; border-radius: 1rem; transition: left 0.6s ease; }
  input[type=checkbox] { visibility: hidden; }
  input[type=checkbox]:checked + label { left: 1.4rem; background: lightgreen; }

  .menu-range { margin: 0 0.8rem 0 0; width: 5rem; background: transparent; color: lightblue; }
  .menu-range:before { content: attr(value); color: white; margin: 0 0.4rem 0 0; font-weight: 800; font-size: 0.6rem; position: relative; top: 0.3rem; }
  input[type=range] { -webkit-appearance: none; }
  input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 1rem; cursor: pointer; background: black; border-radius: 1rem; border: 1px; }
  input[type=range]::-webkit-slider-thumb { border: 1px solid #000000; margin-top: 0.05rem; height: 0.9rem; width: 1.5rem; border-radius: 1rem; background: lightblue; cursor: pointer; -webkit-appearance: none; }
  `;

function createCSS() {
  const el = document.createElement('style');
  el.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(el);
}

function createElem(parent) {
  const el = document.createElement('div');
  el.id = 'menu';
  el.className = 'menu-container';
  if (typeof parent === 'object') parent.appendChild(el);
  else document.getElementById(parent).appendChild(el);
  return el;
}

class Menu {
  constructor(parent) {
    createCSS();
    this.menu = createElem(parent);
    this._id = 0;
    this._maxFPS = 0;
    this.hidden = 0;
  }

  get newID() {
    this._id++;
    return `menu-${this._id}`;
  }

  get ID() {
    return `menu-${this._id}`;
  }

  get width() {
    return this.menu.offsetWidth;
  }

  get height() {
    return this.menu.offsetHeight;
  }

  async addTitle(title) {
    const el = document.createElement('div');
    el.className = 'menu-title';
    el.id = this.newID;
    el.innerHTML = title;
    this.menu.appendChild(el);
    el.addEventListener('click', () => {
      this.hidden = !this.hidden;
      const all = document.getElementsByClassName('menu');
      for (const item of all) item.style.display = this.hidden ? 'none' : 'flex';
    });
  }

  async addLabel(title) {
    const el = document.createElement('div');
    el.className = 'menu menu-label';
    el.id = this.newID;
    el.innerHTML = title;
    this.menu.appendChild(el);
  }

  async addBool(title, object, variable, callback) {
    const el = document.createElement('div');
    el.className = 'menu';
    el.innerHTML = `<div class="menu-checkbox"><input class="menu-checkbox" type="checkbox" id="${this.newID}" ${object[variable] ? 'checked' : ''}/><label class="menu-checkbox-label" for="${this.ID}"></label></div>${title}`;
    this.menu.appendChild(el);
    el.addEventListener('change', (evt) => {
      object[variable] = evt.target.checked;
      if (callback) callback(evt.target.checked);
    });
  }

  async addRange(title, object, variable, min, max, step, callback) {
    const el = document.createElement('div');
    el.className = 'menu';
    el.innerHTML = `<input class="menu-range" type="range" id="${this.newID}" min="${min}" max="${max}" step="${step}" value="${object[variable]}">${title}`;
    this.menu.appendChild(el);
    el.addEventListener('change', (evt) => {
      object[variable] = evt.target.value;
      evt.target.setAttribute('value', evt.target.value);
      if (callback) callback(evt.target.value);
    });
  }

  async addHTML(html) {
    const el = document.createElement('div');
    el.className = 'menu';
    el.id = this.newID;
    if (html) el.innerHTML = html;
    this.menu.appendChild(el);
  }

  async addButton(titleOn, titleOff, callback) {
    const el = document.createElement('button');
    el.className = 'menu menu-button';
    el.style.fontFamily = document.body.style.fontFamily;
    el.style.fontSize = document.body.style.fontSize;
    el.style.fontVariant = document.body.style.fontVariant;
    el.type = 'button';
    el.id = this.newID;
    el.innerText = titleOn;
    this.menu.appendChild(el);
    el.addEventListener('click', () => {
      if (el.innerText === titleOn) el.innerText = titleOff;
      else el.innerText = titleOn;
      if (callback) callback(el.innerText !== titleOn);
    });
  }

  async addValue(title, val) {
    const el = document.createElement('div');
    el.className = 'menu';
    el.id = title;
    el.innerText = `${title}: ${val}`;
    this.menu.appendChild(el);
  }

  // eslint-disable-next-line class-methods-use-this
  async updateValue(title, val) {
    const el = document.getElementById(title);
    el.innerText = `${title}: ${val}`;
  }

  async addChart(title, id) {
    const el = document.createElement('div');
    el.className = 'menu menu-chart-title';
    el.id = this.newID;
    el.innerHTML = `${title}<canvas id="menu-canvas-${id}" class="menu-chart-canvas" width="180px" height="40px"></canvas>`;
    this.menu.appendChild(el);
  }

  // eslint-disable-next-line class-methods-use-this
  async updateChart(id, values) {
    if (!values || (values.length === 0)) return;
    const canvas = document.getElementById(`menu-canvas-${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'darkslategray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width / values.length;
    const max = 1 + Math.max(...values);
    const height = canvas.height / max;
    for (const i in values) {
      const gradient = ctx.createLinearGradient(0, (max - values[i]) * height, 0, 0);
      gradient.addColorStop(0.1, 'lightblue');
      gradient.addColorStop(0.4, 'darkslategray');
      ctx.fillStyle = gradient;
      ctx.fillRect(i * width, 0, width - 4, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '12px "Segoe UI"';
      ctx.fillText(Math.round(values[i]), i * width, canvas.height - 2, width);
    }
  }
}

export default Menu;
