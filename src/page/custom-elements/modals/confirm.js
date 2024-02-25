class ConfirmModalElement extends BaseModalElement {
  /**
   * @typedef {object} ConfirmModalData
   * @property {boolean} sticky - Whether or not the modal should be closeable by anything other than the X and the cancel button
   * @property {string} message - The message to confirm. Default: "Are you sure?"
   * @property {() => void} onOK - Callback function for when the user presses "OK"
   * @property {() => void} onCancel - Callback function for when the user presses "Cancel"
   */

  static tagName = 'confirm-modal';

  /**
   * @param {Partial<ConfirmModalData>} data
   */
  static open(data) {
    const modal = this._open(this.tagName);

    modal.sticky = data.sticky ?? false;
    modal.message = data.message ?? 'Are you sure?';

    modal.onOK = data.onOK ?? null;
    modal.onCancel = data.onCancel ?? null;

    modal._show();
  }

  hide() {
    this._hide();
  }

  /** @param {() => void} value */
  set onOK(value) {
    this._onOKCallback = value;
  }

  /** @param {() => void} value */
  set onCancel(value) {
    this._onCancelCallback = value;
  }

  set message(msg) {
    this._message.innerText = msg;
  }

  _message = null;
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

    this._message = document.createElement('div');
    this._elements.body.base.append(this._message);

    this._elements.header.base.classList.add('hidden');
    Array.from(this._elements.modal.getElementsByTagName('hr')).forEach(x => x.classList.add('hidden'));
  }

  _onOK() {
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

window.addEventListener('DOMContentLoaded', () => customElements.define(ConfirmModalElement.tagName, ConfirmModalElement));