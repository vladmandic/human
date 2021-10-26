let instance = 0;
let CSScreated = false;

let theme = {
  background: '#303030',
  hover: '#505050',
  itemBackground: 'black',
  itemColor: 'white',
  buttonBackground: 'lightblue',
  buttonHover: 'lightgreen',
  checkboxOn: 'lightgreen',
  checkboxOff: 'lightcoral',
  rangeBackground: 'lightblue',
  rangeLabel: 'white',
  chartColor: 'lightblue',
};

function createCSS() {
  if (CSScreated) return;
  const css = `
  :root { --rounded: 0.1rem; }
  .menu { position: absolute; top: 0rem; right: 0; min-width: 180px; width: max-content; padding: 0.2rem 0.8rem 0 0.8rem; line-height: 1.8rem; z-index: 10; background: ${theme.background}; border: none }
  .button { text-shadow: none; }

  .menu-container { display: block; max-height: 100vh; }
  .menu-container-fadeout { max-height: 0; overflow: hidden; transition: max-height, 0.5s ease; }
  .menu-container-fadein { max-height: 100vh; overflow: hidden; transition: max-height, 0.5s ease; }
  .menu-item { display: flex; white-space: nowrap; padding: 0.2rem; cursor: default; width: 100%; }
  .menu-item:hover { background: ${theme.hover} }
  .menu-title { cursor: pointer; }
  .menu-hr { margin: 0.2rem; border: 1px solid rgba(0, 0, 0, 0.5) }
  .menu-label { padding: 0; font-weight: 800; }

  .menu-list { margin-right: 0.8rem; }
  select:focus { outline: none; }
  .menu-list-item { background: ${theme.itemBackground}; color: ${theme.itemColor}; border: none; padding: 0.2rem; font-family: inherit;
    font-variant: inherit; border-radius: var(--rounded); font-weight: 800; }

  .menu-chart-title { padding: 0; font-size: 0.8rem; font-weight: 800; align-items: center}
  .menu-chart-canvas { background: transparent; margin: 0.2rem 0 0.2rem 0.6rem; }
  
  .menu-button { border: 0; background: ${theme.buttonBackground}; width: -webkit-fill-available; padding: 8px; margin: 8px; cursor: pointer;
    border-radius: var(--rounded); justify-content: center; font-family: inherit; font-variant: inherit; font-size: 1rem; font-weight: 800; }
  .menu-button:hover { background: ${theme.buttonHover}; box-shadow: 4px 4px 4px 0 black; }
  .menu-button:focus { outline: none; }

  .menu-checkbox { width: 2.6rem; height: 1rem; background: ${theme.itemBackground}; margin: 0.5rem 1.0rem 0 0; position: relative; border-radius: var(--rounded); }
  .menu-checkbox:after { content: 'OFF'; color: ${theme.checkboxOff}; position: absolute; right: 0.2rem; top: -0.4rem; font-weight: 800; font-size: 0.5rem; }
  .menu-checkbox:before { content: 'ON'; color: ${theme.checkboxOn}; position: absolute; left: 0.3rem; top: -0.4rem; font-weight: 800; font-size: 0.5rem; }
  .menu-checkbox-label { width: 1.3rem; height: 1rem; cursor: pointer; position: absolute; top: 0; left: 0rem; z-index: 1; background: ${theme.checkboxOff};
    border-radius: var(--rounded); transition: left 0.6s ease; }

  input[type=checkbox] { visibility: hidden; }
  input[type=checkbox]:checked + label { left: 1.4rem; background: ${theme.checkboxOn}; }

  .menu-range { margin: 0.2rem 1.0rem 0 0; width: 5rem; background: transparent; color: ${theme.rangeBackground}; }
  .menu-range:before { color: ${theme.rangeLabel}; margin: 0 0.4rem 0 0; font-weight: 800; font-size: 0.6rem; position: relative; top: 0.3rem; content: attr(value); }

  input[type=range] { -webkit-appearance: none; }
  input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 1rem; cursor: pointer; background: ${theme.itemBackground}; border-radius: var(--rounded); border: 1px; }
  input[type=range]::-moz-range-track { width: 100%; height: 1rem; cursor: pointer; background: ${theme.itemBackground}; border-radius: var(--rounded); border: 1px; }
  input[type=range]::-webkit-slider-thumb { border: 1px solid #000000; margin-top: 0; height: 1rem; width: 0.6rem; border-radius: var(--rounded); background: ${theme.rangeBackground}; cursor: pointer; -webkit-appearance: none; }
  input[type=range]::-moz-range-thumb { border: 1px solid #000000; margin-top: 0rem; height: 1rem; width: 0.6rem; border-radius: var(--rounded); background: ${theme.rangeBackground}; cursor: pointer; -webkit-appearance: none; }

  .svg-background { fill:#303030; cursor:pointer; opacity: 0.6; }
  .svg-foreground { fill:white; cursor:pointer; opacity: 0.8; }
  `;
  const el = document.createElement('style');
  el.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(el);
  CSScreated = true;
}

class Menu {
  constructor(parent, title, position, userTheme) {
    if (userTheme) theme = { ...theme, ...userTheme };
    createCSS();
    this.createMenu(parent, title, position);
    this.id = 0;
    this.instance = instance;
    instance++;
    this._maxFPS = 0;
    this.hidden = false;
  }

  createMenu(parent, title = '', position = { top: null, left: null, bottom: null, right: null }) {
    /** @type {HTMLDivElement} */
    this.menu = document.createElement('div');
    this.menu.id = `menu-${instance}`;
    this.menu.className = 'menu';
    if (position) {
      if (position.top) this.menu.style.top = `${position.top}`;
      if (position.bottom) this.menu.style.bottom = `${position.bottom}`;
      if (position.left) this.menu.style.left = `${position.left}`;
      if (position.right) this.menu.style.right = `${position.right}`;
    }

    this.container = document.createElement('div');
    this.container.id = `menu-container-${instance}`;
    this.container.className = 'menu-container menu-container-fadein';

    // set menu title with pulldown arrow
    const elTitle = document.createElement('div');
    elTitle.className = 'menu-title';
    elTitle.id = `menu-title-${instance}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 2rem; height: 2rem; vertical-align: top;">
        <path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48zm-51.37 182.31L232.06 348.16a10.38 10.38 0 0 1-16.12 0L99.37 214.31C92.17 206 97.28 192 107.43 192h233.14c10.15 0 15.26 14 8.06 22.31z" class="svg-background"/>
        <path d="M348.63 214.31L232.06 348.16a10.38 10.38 0 0 1-16.12 0L99.37 214.31C92.17 206 97.28 192 107.43 192h233.14c10.15 0 15.26 14 8.06 22.31z" class="svg-foreground"/>
      </svg>`;
    if (title) elTitle.innerHTML = `${title}${svg}`;
    this.menu.appendChild(elTitle);
    elTitle.addEventListener('click', () => {
      if (this.container && this.menu) {
        this.container.classList.toggle('menu-container-fadeout');
        this.container.classList.toggle('menu-container-fadein');
        // this.menu.style.borderStyle = this.container.classList.contains('menu-container-fadeout') ? 'none' : 'solid';
      }
    });

    this.menu.appendChild(this.container);
    if (typeof parent === 'object') parent.appendChild(this.menu);
    // @ts-ignore undefined
    else document.getElementById(parent).appendChild(this.menu);
  }

  get newID() {
    this.id++;
    return `menu-${this.instance}-${this.id}`;
  }

  get ID() {
    return `menu-${this.instance}-${this.id}`;
  }

  get width() {
    return this.menu ? this.menu.offsetWidth : 0;
  }

  get height() {
    return this.menu ? this.menu.offsetHeight : 0;
  }

  hide() {
    if (this.container && this.container.classList.contains('menu-container-fadein')) {
      this.container.classList.toggle('menu-container-fadeout');
      this.container.classList.toggle('menu-container-fadein');
    }
  }

  visible() {
    return (this.container ? this.container.classList.contains('menu-container-fadein') : false);
  }

  toggle(evt) {
    if (this.container && this.menu) {
      this.container.classList.toggle('menu-container-fadeout');
      this.container.classList.toggle('menu-container-fadein');
      /*
      if (this.container.classList.contains('menu-container-fadein') && evt) {
        const x = evt.x || (evt.touches && evt.touches[0] ? evt.touches[0].pageX : null);
        // const y = evt.y || (evt.touches && evt.touches[0] ? evt.touches[0].pageY : null);
        if (x) this.menu.style.left = `${x - (this.menu.offsetWidth / 2)}px`;
        // if (y) this.menu.style.top = '5.5rem'; // `${evt.y + 55}px`;
        if (this.menu.offsetLeft < 0) this.menu.style.left = '0';
        if ((this.menu.offsetLeft + this.menu.offsetWidth) > window.innerWidth) {
          this.menu.style.left = '';
          this.menu.style.right = '0';
        }
        // this.menu.style.borderStyle = 'solid';
      } else {
        // this.menu.style.borderStyle = 'none';
      }
      */
    }
  }

  addTitle(title) {
    const el = document.createElement('div');
    el.className = 'menu-title';
    el.id = this.newID;
    el.innerHTML = title;
    if (this.menu) this.menu.appendChild(el);
    el.addEventListener('click', () => {
      this.hidden = !this.hidden;
      const all = document.getElementsByClassName('menu');
      for (const item of all) {
        // @ts-ignore
        item.style.display = this.hidden ? 'none' : 'block';
      }
    });
    return el;
  }

  addLabel(title) {
    const el = document.createElement('div');
    el.className = 'menu-item menu-label';
    el.id = this.newID;
    el.innerHTML = title;
    if (this.container) this.container.appendChild(el);
    return el;
  }

  addBool(title, object, variable, callback) {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.innerHTML = `<div class="menu-checkbox"><input class="menu-checkbox" type="checkbox" id="${this.newID}" ${object[variable] ? 'checked' : ''}/><label class="menu-checkbox-label" for="${this.ID}"></label></div>${title}`;
    if (this.container) this.container.appendChild(el);
    el.addEventListener('change', (evt) => {
      if (evt.target) {
        object[variable] = evt.target['checked'];
        if (callback) callback(evt.target['checked']);
      }
    });
    return el;
  }

  async addList(title, items, selected, callback) {
    const el = document.createElement('div');
    el.className = 'menu-item';
    let options = '';
    for (const item of items) {
      const def = item === selected ? 'selected' : '';
      options += `<option value="${item}" ${def}>${item}</option>`;
    }
    el.innerHTML = `<div class="menu-list"><select name="${this.ID}" title="${title}" class="menu-list-item">${options}</select><label for="${this.ID}"></label></div>${title}`;
    el.style.fontFamily = document.body.style.fontFamily;
    el.style.fontSize = document.body.style.fontSize;
    el.style.fontVariant = document.body.style.fontVariant;
    if (this.container) this.container.appendChild(el);
    el.addEventListener('change', (evt) => {
      if (callback && evt.target) callback(items[evt.target['selectedIndex']]);
    });
    return el;
  }

  addRange(title, object, variable, min, max, step, callback) {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.innerHTML = `<input class="menu-range" type="range" title="${title}" id="${this.newID}" min="${min}" max="${max}" step="${step}" value="${object[variable]}">${title}`;
    if (this.container) this.container.appendChild(el);
    el.addEventListener('change', (evt) => {
      if (evt.target) {
        object[variable] = parseInt(evt.target['value']) === parseFloat(evt.target['value']) ? parseInt(evt.target['value']) : parseFloat(evt.target['value']);
        // @ts-ignore
        evt.target.setAttribute('value', evt.target['value']);
        if (callback) callback(evt.target['value']);
      }
    });
    el['input'] = el.children[0];
    return el;
  }

  addHTML(html) {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.id = this.newID;
    if (html) el.innerHTML = html;
    if (this.container) this.container.appendChild(el);
    return el;
  }

  addButton(titleOn, titleOff, callback) {
    const el = document.createElement('button');
    el.className = 'menu-item menu-button';
    el.style.fontFamily = document.body.style.fontFamily;
    el.style.fontSize = document.body.style.fontSize;
    el.style.fontVariant = document.body.style.fontVariant;
    el.type = 'button';
    el.id = this.newID;
    el.innerText = titleOn;
    if (this.container) this.container.appendChild(el);
    el.addEventListener('click', () => {
      if (el.innerText === titleOn) el.innerText = titleOff;
      else el.innerText = titleOn;
      if (callback) callback(el.innerText !== titleOn);
    });
    return el;
  }

  addValue(title, val, suffix = '') {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.id = `menu-val-${title}`;
    el.innerText = `${title}: ${val}${suffix}`;
    if (this.container) this.container.appendChild(el);
    return el;
  }

  // eslint-disable-next-line class-methods-use-this
  updateValue(title, val, suffix = '') {
    const el = document.getElementById(`menu-val-${title}`);
    if (el) el.innerText = `${title}: ${val}${suffix}`;
    else this.addValue(title, val);
  }

  addChart(title, id, width = 150, height = 40, color) {
    if (color) theme.chartColor = color;
    const el = document.createElement('div');
    el.className = 'menu-item menu-chart-title';
    el.id = this.newID;
    el.innerHTML = `<font color=${theme.chartColor}>${title}</font><canvas id="menu-canvas-${id}" class="menu-chart-canvas" width="${width}px" height="${height}px"></canvas>`;
    if (this.container) this.container.appendChild(el);
    return el;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateChart(id, values) {
    if (!values || (values.length === 0)) return;
    /** @type {HTMLCanvasElement} */ 
    // @ts-ignore undefined
    const canvas = document.getElementById(`menu-canvas-${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width / values.length;
    const max = 1 + Math.max(...values);
    const height = canvas.height / max;
    for (let i = 0; i < values.length; i++) {
      const gradient = ctx.createLinearGradient(0, (max - values[i]) * height, 0, 0);
      gradient.addColorStop(0.1, theme.chartColor);
      gradient.addColorStop(0.4, theme.background);
      ctx.fillStyle = gradient;
      ctx.fillRect(i * width, 0, width - 4, canvas.height);
      ctx.fillStyle = theme.background;
      ctx.font = `${width / 1.5}px "Segoe UI"`;
      ctx.fillText(Math.round(values[i]).toString(), i * width + 1, canvas.height - 1, width - 1);
    }
  }
}

export default Menu;
