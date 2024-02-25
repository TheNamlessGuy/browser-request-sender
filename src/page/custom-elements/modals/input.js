class InputModalElement extends BaseModalElement {
  /**
   * @typedef {object} InputModalData
   * @property {boolean} sticky - Whether or not the modal should be closeable by anything other than the X and the cancel button
   * @property {string} value - The pre-filled value of the input field
   * @property {string} placeholder - The placeholder value of the input field
   * @property {(element: InputModalElement) => void} onOK - Callback function for when the user presses "OK"
   * @property {(element: InputModalElement) => void} onCancel - Callback function for when the user presses "Cancel"
   * @property {(element: InputModalElement) => string[]|null} onValidation - Callback function for checking if the given value is acceptable. Return a list of errors, or null if the value is OK.
   */

  static tagName = 'input-modal';

  /**
   * @param {Partial<InputModalData>} data
   */
  static open(data) {
    const modal = this._open(this.tagName);

    modal.sticky = data.sticky ?? false;

    modal.value = data.value ?? '';
    modal.placeholder = data.placeholder ?? '';

    modal.onOK = data.onOK ?? null;
    modal.onCancel = data.onCancel ?? null;
    modal.onValidation = data.onValidation ?? null;

    modal._show();

    modal._input.focus();
  }

  hide() {
    this._hide();
  }

  get value() {
    return this._input.value;
  }

  /** @param {string} value */
  set value(value) {
    this._input.value = value;
  }

  /** @param {string} value */
  set placeholder(value) {
    this._input.placeholder = value;
  }

  /** @param {(element: InputModalElement) => void} value */
  set onOK(value) {
    this._onOKCallback = value;
  }

  /** @param {(element: InputModalElement) => void} value */
  set onCancel(value) {
    this._onCancelCallback = value;
  }

  /** @param {(element: InputModalElement) => string[]|null} value */
  set onValidation(value) {
    this._onValidationCallback = value;
  }

  _input = null;
  _onOKCallback = null;
  _onCancelCallback = null;

  constructor() {
    super();

    this._setFooterButtons([{
      title: 'OK',
      onClick: () => this._onOK(),
      classes: ['green'],
    }, {
      title: 'Cancel',
      onClick: () => this._onCancel(),
      classes: ['red'],
    }]);

    this._input = document.createElement('input');
    this._input.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        this._onOK();
      } else if (e.key === 'Escape') {
        this._onCancel();
      }
    }.bind(this));
    this._elements.body.base.append(this._input);

    this._elements.header.base.classList.add('hidden');
    Array.from(this._elements.modal.getElementsByTagName('hr')).forEach(x => x.classList.add('hidden'));
  }

  _onOK() {
    if (this._onValidationCallback) {
      this._elements.errors.clear();

      const errors = this._onValidationCallback(this);
      if (errors != null) {
        this._elements.errors.addAll(...errors);
        return;
      }
    }

    if (this._onOKCallback) {
      this._onOKCallback(this);
    }

    this.hide();
  }

  _onCancel() {
    if (this._onCancelCallback) {
      this._onCancelCallback(this);
    }

    this.hide();
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define(InputModalElement.tagName, InputModalElement));