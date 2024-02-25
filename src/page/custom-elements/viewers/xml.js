class XmlViewerElement extends HTMLElement {
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
    style.textContent = `
* {
  font-family: monospace;
}

.purple { color: #CC00CC; }
.green { color: #669900; }
.orange { color: #FF6600; }
.blue { color: #CC99FF; }
.white { color: #FFFFFF; }
.yellow { color: #FFFF33; }

span.indent {
  white-space: pre;
  color: rgba(255, 255, 255, 0.1);
}

.sidebar {
  background-color: #000033;
  display: inline-block;
  white-space: pre;
  padding: 2px 5px;
  margin-right: 5px;
  user-select: none;
}
.sidebar.collapsible { cursor: pointer; }

.collapsed-display {
  background-color: #000033;
  color: #FFFFFF;
  border-radius: 5px;
}
`;

    const container = document.createElement('div');

    this._elements.errors = document.createElement('error-container');
    container.append(this._elements.errors);

    this._elements.display = document.createElement('div');
    this._elements.display.classList.add('display');
    container.append(this._elements.display);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  clear() {
    this._value.raw = null;
    this._value.xml = null;
    this._elements.display.innerText = '';
    this._elements.errors.clear();
  }

  get value() {
    return this._value.raw;
  }

  /** @param {string|null} value */
  set value(value) {
    this.clear();
    this._value.raw = value;

    let parsed = null;
    if (this._value.raw) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(this._value.raw, 'application/xml');
      const error = doc.querySelector('parsererror');
      if (error) {
        this._elements.errors.add("The given value wasn't a proper XML");
      } else {
        parsed = doc;
      }
    }

    if (parsed == null) {
      this._elements.display.innerText = this._value.raw;
    } else {
      for (const child of parsed.children) {
        this._display(child);
      }
    }
  }

  _show = {
    bracket: (text) => this._color(text, 'purple'),
    symbol: (text) => this._color(text, 'white'),
    string: (text) => this._color(`"${text}"`, 'green'),
    number: (text) => this._color(text, 'blue'),
    bool: (text) => this._color(text, 'orange'),
    value: (text) => {
      if (typeof text === 'string') {
        return this._show.string(text);
      } else if ([true, false].includes(text)) {
        return this._show.bool(text);
      } else { // Is number
        return this._show.number(text);
      }
    },
  };

  _color(text, color) {
    const element = document.createElement('span');
    element.innerText = text;
    element.classList.add(color);
    return element;
  }

  /**
   * @typedef {object} Extras
   * @property {number} indent
   * @property {boolean} [collapsible]
   */

  /**
   * @param {Document} element
   * @param {boolean} start
   * @param {boolean} selfClose
   * @returns {HTMLSpanElement}
   */
  _tag(element, start, selfClose = false) {
    const tag = document.createElement('span');

    tag.append(this._show.bracket('<'));

    if (!start) { tag.append(this._show.symbol('/')); }
    tag.append(this._color(element.tagName, 'yellow'));
    if (start) {
      for (const attribute of element.attributes) {
        tag.append(this._color(' ', 'white'));
        tag.append(this._color(attribute.name, 'orange'));
        tag.append(this._color('=', 'white'));
        tag.append(this._show.string(attribute.value));
      }
    }

    if (start && selfClose) { tag.append(this._show.symbol(' /')); }
    tag.append(this._show.bracket('>'));

    return tag;
  }

  _onelineTag(element) {
    const container = document.createElement('span');

    const children = [];
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        children.push(this._color(node.textContent, 'white'));
      }
    }

    if (children.length === 0) {
      container.append(this._tag(element, true, true));
    } else {
      container.append(this._tag(element, true));
      container.append(...children);
      container.append(this._tag(element, false));
    }

    return container;
  }

  /**
   * @param {Document} element
   * @param {Extras} [extras={}]
   */
  _display(element, extras = {}) {
    extras.indent = extras.indent ?? 0;

    if (element.nodeType === Node.TEXT_NODE) {
      if (element.textContent.trim().length > 0) {
        new _XmlViewerElementRow(this._elements.display, this._color(element.textContent, 'white'), extras);
      }

      return [];
    } else if (element.children.length === 0) {
      return [new _XmlViewerElementRow(this._elements.display, this._onelineTag(element), extras)];
    } else {
      const start = new _XmlViewerElementRow(this._elements.display, this._tag(element, true), {...extras, ...{collapsible: true}});

      let owned = [];
      for (const node of element.childNodes) {
        owned.push(...this._display(node, {...extras, ...{indent: extras.indent + 1}}));
      }
      start.owned = owned.filter(x => x != null);

      const end = new _XmlViewerElementRow(this._elements.display, this._tag(element, false), extras);

      return [start, end];
    }
  }
}

class _XmlViewerElementRow {
  _indentBy = 2;
  _collapsible = false;

  /** @type {null|'user'|_XmlViewerElementRow} */
  _collapsedBy = null;

  /** @type {_XmlViewerElementRow[]} */
  _ownedRows = [];

  _elements = {
    row: null,
    sidebar: null,
    indent: null,
    container: null,
    collapsedDisplay: null,
  };

  /**
   * @param {HTMLDivElement} container
   * @param {HTMLSpanElement} content
   * @param {Extras & {indentBy: number}} extras
   */
  constructor(container, content, extras) {
    this._indentBy = extras.indentBy ?? 2;
    this._collapsible = extras.collapsible ?? false;

    this._elements.row = document.createElement('div');

    this._elements.sidebar = document.createElement('span');
    this._elements.sidebar.classList.add('sidebar');
    if (!this._collapsible) {
      this._elements.sidebar.innerText = ' ';
    } else {
      this._elements.sidebar.innerText = 'v';
      this._elements.sidebar.classList.add('collapsible');
      this._elements.sidebar.addEventListener('click', this._onSidebarClick.bind(this));
    }
    this._elements.row.append(this._elements.sidebar);

    this._elements.indent = document.createElement('span');
    this._elements.indent.classList.add('indent');
    this._elements.indent.setAttribute('indent', extras.indent ?? 0);
    this._elements.indent.innerText = '∙'.repeat((extras.indent ?? 0) * this._indentBy);
    this._elements.row.append(this._elements.indent);

    this._elements.container = document.createElement('span');
    this._elements.container.append(content);
    this._elements.row.append(this._elements.container);

    this._elements.collapsedDisplay = document.createElement('span');
    this._elements.collapsedDisplay.classList.add('collapsed-display');
    this._elements.collapsedDisplay.style.display = 'none';
    this._elements.collapsedDisplay.innerText = '∙∙∙';
    this._elements.row.append(this._elements.collapsedDisplay);

    container.append(this._elements.row);
  }

  set owned(owned) {
    this._ownedRows = owned;
  }

  /**
   * @param {'none'|null} to
   * @param {_XmlViewerElementRow} by
   */
  collapse(to, by) {
    this._elements.row.style.display = to;
    this._collapsedBy = (this._collapsedBy === 'user') ? 'user' : by;

    if (this._collapsible && this._collapsedBy != 'user') {
      for (const row of this._ownedRows) {
        row.collapse(to);
      }
    }
  }

  _onSidebarClick() {
    this._collapsedBy = (this._collapsedBy == null) ? 'user' : null;

    let collapseTo = null;

    if (this._collapsedBy != null) {
      this._elements.collapsedDisplay.style.display = null;
      this._elements.sidebar.innerText = '>';
      collapseTo = 'none';
    } else {
      this._elements.collapsedDisplay.style.display = 'none';
      this._elements.sidebar.innerText = 'v';
      collapseTo = null;
    }

    for (const row of this._ownedRows) {
      row.collapse(collapseTo);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('xml-viewer', XmlViewerElement));