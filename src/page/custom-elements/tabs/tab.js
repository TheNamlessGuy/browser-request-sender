class TabElement extends HTMLElement {
  _title = null;
  _bodies = [];
  _extras = [];

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

span {
  font-size: 26px;
  cursor: pointer;
  user-select: none;
  margin-right: 10px;
}

span:hover {
  color: var(--text-darkened-color);
}

span.active {
  text-decoration: underline;
}
`;

    while (this.children.length > 0) {
      const child = this.children[0];
      child.remove();

      if (child.hasAttribute('body')) {
        this._bodies.push(child);
      } else if (child.hasAttribute('extra')) {
        this._extras.push(child);
      }
    }

    this._title = document.createElement('span');
    this._title.innerText = this.getAttribute('title');
    this._title.addEventListener('click', () => this.dispatchEvent(new Event('click')));

    this.attachShadow({mode: 'closed'}).append(style, this._title);
  }

  attach(tabContainer, bodyContainer) {
    tabContainer.append(this, ...this._extras);
    bodyContainer.append(...this._bodies);
  }

  activate() {
    this._toggleActive(null);
    this._title.classList.add('active');
  }

  deactivate() {
    this._toggleActive('none');
    this._title.classList.remove('active');
  }

  get body() {
    return this._bodies[0];
  }

  /** @param {'none'|null} to */
  _toggleActive(to) {
    this._extras.forEach(x => x.style.display = to);
    this._bodies.forEach(x => x.style.display = to);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('tab-tab', TabElement));