let loader;

export const showLoader = (msg) => { loader.setAttribute('msg', msg); loader.style.display = 'block'; };
export const hideLoader = () => loader.style.display = 'none';

class ComponentLoader extends HTMLElement { // watch for attributes
  message = document.createElement('div');

  static get observedAttributes() { return ['msg']; }

  attributeChangedCallback(_name, _prevVal, currVal) {
    this.message.innerHTML = currVal;
  }

  connectedCallback() { // triggered on insert
    this.attachShadow({ mode: 'open' });
    const css = document.createElement('style');
    css.innerHTML = `
      .loader-container { top: 450px; justify-content: center; position: fixed; width: 100%; }
      .loader-message { font-size: 1.5rem; padding: 1rem; }
      .loader { width: 300px; height: 300px; border: 3px solid transparent; border-radius: 50%; border-top: 4px solid #f15e41; animation: spin 4s linear infinite; position: relative; }
      .loader::before, .loader::after { content: ""; position: absolute; top: 6px; bottom: 6px; left: 6px; right: 6px; border-radius: 50%; border: 4px solid transparent; }
      .loader::before { border-top-color: #bad375; animation: 3s spin linear infinite; }
      .loader::after { border-top-color: #26a9e0; animation: spin 1.5s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    const container = document.createElement('div');
    container.id = 'loader-container';
    container.className = 'loader-container';
    loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader';
    this.message.id = 'loader-message';
    this.message.className = 'loader-message';
    this.message.innerHTML = '';
    container.appendChild(this.message);
    container.appendChild(loader);
    this.shadowRoot?.append(css, container);
    loader = this;
  }
}

customElements.define('component-loader', ComponentLoader);
