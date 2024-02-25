class EzSelectElement extends HTMLElement {
  /**
   * @typedef {object} EzSelectOption
   * @property {string} value
   * @property {string} display
   * @property {boolean} [selected]
   */

  static tagName = 'ez-select';

  /**
   * @typedef {object} EzSelectCreateData
   * @property {EzSelectOption[]} options
   * @property {() => void | (() => void)[]} onChange
   */

  /** @param {Partial<EzSelectCreateData>} data */
  static create(data) {
    const element = document.createElement(this.tagName);
    this._initialize(element, data);
    return element;
  }

  /**
   * @param {EzSelectElement} element
   * @param {EzSelectCreateData} data
   */
  static _initialize(element, data) {
    if ('options' in data) {
      element.options = data.options;
    }

    if ('onChange' in data) {
      const onChange = Array.isArray(data.onChange) ? data.onChange : [data.onChange];
      onChange.forEach(x => element.addEventListener('change', x));
    }
  }

  _container = null;
  _style = null;
  _select = null;

  constructor() {
    super();

    this._style = document.createElement('style');
    this._style.textContent = `
@import url('/src/page/index.css');
`;

    this._container = document.createElement('div');

    this._select = document.createElement('select');
    this._select.part = 'select';
    this._select.addEventListener('change', () => this.dispatchEvent(new Event('change')));
    this._container.append(this._select);

    this.attachShadow({mode: 'closed'}).append(this._style, this._container);
  }

  /**
   * @param {EzSelectOption[]} options
   */
  set options(options) {
    while (this._select.children.length > 0) {
      this._select.children[0].remove();
    }

    for (const option of options) {
      const element = document.createElement('option');
      element.innerText = option.display;
      element.value = option.value;
      element.selected = option.selected ?? false;
      this._select.append(element);
    }
  }

  get value() {
    return this._select.value;
  }

  set value(value) {
    this._select.value = value;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define(EzSelectElement.tagName, EzSelectElement));