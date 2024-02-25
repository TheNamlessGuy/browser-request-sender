class SvgViewerElement extends HTMLElement {
  _value = {
    raw: null,
  };

  _elements = {
    errors: null,
    display: null,
  };

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = ``;

    const container = document.createElement('div');

    this._elements.errors = document.createElement('error-container');
    container.append(this._elements.errors);

    this._elements.display = document.createElement('div');
    container.append(this._elements.display);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  clear() {
    this._value.raw = null;
    this._elements.display.innerText = '';
  }

  get value() {
    return this._value.raw;
  }

  /** @param {string|null} value */
  set value(value) {
    this.clear();
    this._elements.errors.clear();
    this._value.raw = value;

    if (this._value.raw) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(this._value.raw, 'application/xml');
      const error = doc.querySelector('parsererror');
      const svgs = doc.querySelectorAll('svg');
      if (error || svgs.length === 0) {
        this._elements.errors.add("The given value wasn't a proper SVG");
        this._elements.display.innerText = this._value.raw;
      } else {
        this._elements.display.append(...svgs);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('svg-viewer', SvgViewerElement));