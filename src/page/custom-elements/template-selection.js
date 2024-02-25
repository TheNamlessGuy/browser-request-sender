class TemplateSelectionElement extends HTMLElement {
  _btn = null;

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

button.red {
  margin-right: 5px;
}
`;

    const container = document.createElement('div');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '🗑';
    deleteBtn.classList.add('red');
    deleteBtn.addEventListener('click', () => {
      ConfirmModalElement.open({
        message: `Do you really want to delete template '${this.name}'?`,
        onOK: () => this.dispatchEvent(new Event('delete-me')),
      });
    });
    container.append(deleteBtn);

    this._btn = document.createElement('button');
    this._btn.addEventListener('click', () => this.dispatchEvent(new Event('select-me')));
    container.append(this._btn);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  get name() {
    return this._btn.innerText;
  }

  set name(name) {
    this._btn.innerText = name;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('template-selection', TemplateSelectionElement));