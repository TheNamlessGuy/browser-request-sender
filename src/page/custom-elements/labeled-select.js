class LabeledSelectElement extends EzSelectElement {
  static tagName = 'labeled-select';

  /**
   * @typedef {object} LabeledSelectCreateData
   * @extends EzSelectCreateData
   * @property {string} label
   */

  /** @param {Partial<LabeledSelectCreateData>} data */
  static create(data) {
    const element = document.createElement(this.tagName);
    this._initialize(element, data);
    return element;
  }

  /**
   * @param {LabeledSelectElement} element
   * @param {LabeledSelectCreateData} data
   */
  static _initialize(element, data) {
    super._initialize(element, data);

    if ('label' in data) {
      element.label = data.label;
    }
  }

  _label = null;

  constructor() {
    super();

    this._label = document.createElement('label');
    this._label.part = 'label';
    this._container.insertBefore(this._label, this._select);

    this._style.textContent += `
label {
  margin-right: 5px;
}
`;
  }

  set label(label) {
    this._label.innerText = label == null ? '' : `${label}:`;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('labeled-select', LabeledSelectElement));