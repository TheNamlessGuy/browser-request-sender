class SelectBodyTabElement extends TabElement {
  constructor() {
    super();

    this._extras[0].addEventListener('change', () => this._onTypeChange());
  }

  activate() {
    super.activate();
    this._onTypeChange();
  }

  _onTypeChange() {
    for (let i = 0; i < this._bodies.length; ++i) {
      if (this._extras[0].selectedIndex === i) {
        this._bodies[i].style.display = null;
      } else {
        this._bodies[i].style.display = 'none';
      }
    }
  }

  get body() {
    return this._bodies[this._extras[0].selectedIndex];
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('tab-select-body', SelectBodyTabElement));