class BaseModalElement extends HTMLElement {
  static _open(element) {
    const modal = new (customElements.get(element))();
    modal.addEventListener('hidden', () => modal.remove());
    document.body.append(modal);
    return modal;
  }

  /** @param {{title: string, onClick: () => void, classes?: string[]}[]} buttons */
  _setFooterButtons(buttons) {
    for (const button of buttons) {
      const element = document.createElement('button');
      element.innerText = button.title;
      if (button.classes) {
        element.classList.add(...button.classes);
      }
      element.addEventListener('click', button.onClick);
      this._elements.footer.buttonContainer.append(element);
    }
  }

  /** @param {boolean|null} sticky */
  set sticky(sticky) {
    this._sticky = sticky ?? false;
  }

  /** @param {string|null} title */
  set title(title) {
    this._elements.header.title.innerText = title ?? 'Modal';
  }

  _elements = {
    style: null,
    container: null,
    modal: null,

    header: {
      base: null,
      title: null,
      xButton: null,
    },

    body: {
      base: null,
    },

    footer: {
      base: null,
      buttonContainer: null,
    },

    errors: null,
  };

  _sticky = false;

  constructor() {
    super();

    this.style.position = 'absolute';
    this.style.top = '0px';
    this.style.left = '0px';
    this.style.width = '100vw';
    this.style.height = '100vh';
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this._hide();

    this._elements.style = document.createElement('style');
    this._elements.style.textContent = `
@import url('/src/page/index.css');

.container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: var(--active-color);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.header {
  height: fit-content;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  font-size: 1.5em;
  margin-right: 10px;
}
.header-x-button {
  height: fit-content;
  width: fit-content;
}

.footer {
  margin-top: 10px;
}
.footer-buttons {
  float: right;
}
.footer-buttons > button {
  margin-right: 5px;
}

.body {
  flex-grow: 10;
}

hr {
  width: 95%;
}

div.error {
  background-color: var(--red-color);
  color: var(--text-color);
  border-radius: 5px;
  padding: 3px 5px;
  margin: 5px 0;
}
`.trim();

    this._elements.container = document.createElement('div');
    this._elements.container.classList.add('container');
    this._elements.container.addEventListener('click', function(e) { if (!this._sticky && e.target === this._elements.container) { this._hide(); } }.bind(this));

    this._elements.modal = document.createElement('div');
    this._elements.modal.classList.add('modal');
    this._elements.container.append(this._elements.modal);

    this._initHeader();
    this._elements.modal.append(document.createElement('hr'));
    this._initBody();
    this._elements.modal.append(document.createElement('hr'));
    this._initFooter();

    this._elements.errors = document.createElement('error-container');
    this._elements.body.base.append(this._elements.errors);

    this.attachShadow({mode: 'closed'}).append(this._elements.style, this._elements.container);
  }

  _initHeader() {
    this._elements.header.base = document.createElement('div');
    this._elements.header.base.classList.add('header');
    this._elements.modal.append(this._elements.header.base);

    this._elements.header.title = document.createElement('span');
    this._elements.header.title.classList.add('header-title');
    this._elements.header.base.append(this._elements.header.title);

    this._elements.header.xButton = document.createElement('button');
    this._elements.header.xButton.classList.add('header-x-button');
    this._elements.header.xButton.innerText = '⨯';
    this._elements.header.xButton.addEventListener('click', () => this._onHeaderX());
    this._elements.header.base.append(this._elements.header.xButton);
  }

  _onHeaderX() {
    this._hide();
  }

  _initBody() {
    this._elements.body.base = document.createElement('div');
    this._elements.body.base.classList.add('body');
    this._elements.modal.append(this._elements.body.base);
  }

  _initFooter() {
    this._elements.footer.base = document.createElement('div');
    this._elements.footer.base.classList.add('footer');
    this._elements.modal.append(this._elements.footer.base);

    this._elements.footer.buttonContainer = document.createElement('div');
    this._elements.footer.buttonContainer.classList.add('footer-buttons');
    this._elements.footer.base.append(this._elements.footer.buttonContainer);
  }

  _show() {
    this.style.display = 'block';
  }

  _hide() {
    this.style.display = 'none';
    this.dispatchEvent(new Event('hidden'));
  }
}