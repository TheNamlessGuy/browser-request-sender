class ErrorContainerElement extends HTMLElement {
  _container = null;

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = ``;

    this._container = document.createElement('div');

    this.clear();
    this.attachShadow({mode: 'closed'}).append(style, this._container);
  }

  clear() {
    this._container.style.display = 'none';

    while (this._container.children.length > 0) {
      this._container.children[0].remove();
    }
  }

  /** @param {string} msg */
  add(msg) {
    this._container.style.display = null;

    const error = document.createElement('error-element');
    error.message = msg;
    this._container.append(error);
  }

  addAll(...msgs) {
    msgs.forEach(m => this.add(m));
  }
}

class ErrorElement extends HTMLElement {
  _span = null;

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #900;
  padding: 3px;
  margin: 3px;
  border-radius: 5px;
  color: #FFF;
  font-size: 18px;
}

button {
  border: none;
  background: none;
  color: #FFF;
  cursor: pointer;
  font-size: 18px;
}
`;

    const container = document.createElement('div');

    this._span = document.createElement('span');
    container.append(this._span);

    const removeBtn = document.createElement('button');
    removeBtn.innerText = '⨯';
    removeBtn.addEventListener('click', () => this.remove());
    container.append(removeBtn);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  set message(msg) {
    this._span.innerText = msg;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('error-container', ErrorContainerElement);
  customElements.define('error-element', ErrorElement);
});