let callbackFunction = null;

function createElement(type, config) {
  const htmlElement = document.createElement(type);
  if (config === undefined) return htmlElement;
  if (config.className) htmlElement.className = config.className;
  if (config.content) htmlElement.textContent = config.content;
  if (config.style) htmlElement.style = config.style;
  if (config.children) config.children.forEach((el) => !el || htmlElement.appendChild(el));
  return htmlElement;
}

function createExpandedElement(node) {
  const iElem = createElement('i');
  if (node.expanded) { iElem.className = 'fas fa-caret-down'; } else { iElem.className = 'fas fa-caret-right'; }
  const caretElem = createElement('div', { style: 'width: 18px; text-align: center; cursor: pointer', children: [iElem] });
  const handleClick = node.toggle.bind(node);
  caretElem.addEventListener('click', handleClick);
  const indexElem = createElement('div', { className: 'json json-index', content: node.key });
  indexElem.addEventListener('click', handleClick);
  const typeElem = createElement('div', { className: 'json json-type', content: node.type });
  const keyElem = createElement('div', { className: 'json json-key', content: node.key });
  keyElem.addEventListener('click', handleClick);
  const sizeElem = createElement('div', { className: 'json json-size' });
  sizeElem.addEventListener('click', handleClick);
  if (node.type === 'array') {
    sizeElem.innerText = `[${node.children.length} items]`;
  } else if (node.type === 'object') {
    const size = node.children.find((item) => item.key === 'size');
    sizeElem.innerText = size ? `{${size.value.toLocaleString()} bytes}` : `{${node.children.length} properties}`;
  }
  let lineChildren;
  if (node.key === null) lineChildren = [caretElem, typeElem, sizeElem];
  else if (node.parent.type === 'array') lineChildren = [caretElem, indexElem, sizeElem];
  else lineChildren = [caretElem, keyElem, sizeElem];
  const lineElem = createElement('div', { className: 'json-line', children: lineChildren });
  if (node.depth > 0) lineElem.style = `margin-left: ${node.depth * 24}px;`;
  return lineElem;
}

function createNotExpandedElement(node) {
  const caretElem = createElement('div', { style: 'width: 18px' });
  const keyElem = createElement('div', { className: 'json json-key', content: node.key });
  const separatorElement = createElement('div', { className: 'json-separator', content: ':' });
  const valueType = ` json-${typeof node.value}`;
  const valueContent = node.value.toLocaleString();
  const valueElement = createElement('div', { className: `json json-value${valueType}`, content: valueContent });
  const lineElem = createElement('div', { className: 'json-line', children: [caretElem, keyElem, separatorElement, valueElement] });
  if (node.depth > 0) lineElem.style = `margin-left: ${node.depth * 24}px;`;
  return lineElem;
}

function createNode() {
  return {
    key: '',
    parent: {},
    value: null,
    expanded: false,
    type: '',
    children: [],
    elem: {},
    depth: 0,

    hideChildren() {
      if (Array.isArray(this.children)) {
        this.children.forEach((item) => {
          // @ts-ignore
          item['elem']['classList'].add('hide');
          // @ts-ignore
          if (item['expanded']) item.hideChildren();
        });
      }
    },
    showChildren() {
      if (Array.isArray(this.children)) {
        this.children.forEach((item) => {
          // @ts-ignore
          item['elem']['classList'].remove('hide');
          // @ts-ignore
          if (item['expanded']) item.showChildren();
        });
      }
    },
    toggle() {
      if (this.expanded) {
        this.hideChildren();
        const icon = this.elem?.querySelector('.fas');
        icon.classList.replace('fa-caret-down', 'fa-caret-right');
        if (callbackFunction !== null) callbackFunction(null);
      } else {
        this.showChildren();
        const icon = this.elem?.querySelector('.fas');
        icon.classList.replace('fa-caret-right', 'fa-caret-down');
        if (this.type === 'object') {
          if (callbackFunction !== null) callbackFunction(`${this.parent?.key}/${this.key}`);
        }
      }
      this.expanded = !this.expanded;
    },
  };
}

function getType(val) {
  let type
  if (Array.isArray(val)) type = 'array';
  else if (val === null) type = 'null';
  else type = typeof val;
  return type;
}

function traverseObject(obj, parent, filter) {
  for (const key in obj) {
    const child = createNode();
    child.parent = parent;
    child.key = key;
    child.type = getType(obj[key]);
    child.depth = parent.depth + 1;
    child.expanded = false;
    if (Array.isArray(filter)) {
      for (const filtered of filter) {
        if (key === filtered) return;
      }
    }
    if (typeof obj[key] === 'object') {
      child.children = [];
      parent.children.push(child);
      traverseObject(obj[key], child, filter);
      child.elem = createExpandedElement(child);
    } else {
      child.value = obj[key];
      child.elem = createNotExpandedElement(child);
      parent.children.push(child);
    }
  }
}

function createTree(obj, title, filter) {
  const tree = createNode();
  tree.type = title;
  tree.key = title;
  tree.children = [];
  tree.expanded = true;
  traverseObject(obj, tree, filter);
  tree.elem = createExpandedElement(tree);
  return tree;
}

function traverseTree(node, callback) {
  callback(node);
  if (node.children !== null) node.children.forEach((item) => traverseTree(item, callback));
}

async function jsonView(json, element, title = '', filter = []) {
  const tree = createTree(json, title, filter);
  traverseTree(tree, (node) => {
    if (!node.expanded) node.hideChildren();
    element.appendChild(node.elem);
  });
}

export default jsonView;
