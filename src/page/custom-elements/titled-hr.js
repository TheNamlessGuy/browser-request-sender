// https://stackoverflow.com/a/26634224
class TitledHRElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

div {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 3px 0;
}

div::before,
div::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--text-color);
}

div:not(:empty)::before {
  margin-right: .25em;
}

div:not(:empty)::after {
  margin-left: .25em;
}
`;

    const container = document.createElement('div');
    container.innerText = this.innerText;

    this.attachShadow({mode: 'closed'}).append(style, container);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('titled-hr', TitledHRElement));