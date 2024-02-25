class JSONViewerElement extends HTMLElement {
  _value = {
    raw: null,
    json: null,
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
    this._value.json = null;
    this._elements.display.innerText = '';
  }

  /** @param {string|null} value */
  set value(value) {
    this.clear();
    this._elements.errors.clear();
    this._value.raw = value;

    if (value == null || value.length === 0) {
      this._value.json = null;
    } else {
      try {
        this._value.json = JSON.parse(value);
      } catch {
        this._value.json = null;
        this._elements.errors.add("The given value wasn't a proper JSON format");
      }
    }

    if (this._value.json == null) {
      this._elements.display.innerText = this._value.raw;
    } else if (Array.isArray(this._value.json)) {
      this._array(this._value.json);
    } else {
      this._object(this._value.json);
    }
  }

  get value() {
    return this._value.raw;
  }

  _isObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }

  _display = {
    bracket: (text) => this._color(text, 'purple'),
    symbol: (text) => this._color(text, 'white'),
    string: (text) => this._color(`"${text}"`, 'green'),
    number: (text) => this._color(text, 'blue'),
    bool: (text) => this._color(text, 'orange'),
    value: (text) => {
      if (typeof text === 'string') {
        return this._display.string(text);
      } else if ([true, false].includes(text)) {
        return this._display.bool(text);
      } else { // Is number
        return this._display.number(text);
      }
    },
  };

  _color(text, color) {
    const element = document.createElement('span');
    element.innerText = text;
    element.classList.add(color);
    return element;
  }

  _indentBy = 2;
  set indentBy(value) {
    this._indentBy = value;
    Array.from(this._elements.display.getElementsByClassName('indent')).forEach(x => {
      const indent = parseInt(x.getAttribute('indent'), 10);
      x.innerText = '∙'.repeat(indent * this._indentBy);
    });
  }

  /**
   * @typedef {object} Extras
   * @property {number} indent
   * @property {HTMLElement[]} [prefix]
   * @property {HTMLElement[]} [suffix]
   * @property {boolean} [collapsible]
   */

  _collapsible(startBracket, endBracket, extras, iterate) {
    extras.indent = extras.indent ?? 0;

    extras.collapsible = extras.collapsible ?? !extras.prefix;
    const start = new _JSONViewerElementRow(this._elements.display, this._display.bracket(startBracket), extras);

    extras.prefix = [];
    extras.collapsible = false;

    start.owned = iterate(extras);

    const end = new _JSONViewerElementRow(this._elements.display, this._display.bracket(endBracket), extras);

    return [start, end];
  }

  /** @param {Extras} [extras={}] */
  _object(object, extras = {}) {
    return this._collapsible('{', '}', extras, (extras) => {
      const ownedRows = [];

      const keys = Object.keys(object);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const value = object[key];

        const prefix = [this._display.string(key), this._display.symbol(': ')];
        const suffix = i + 1 < keys.length ? [this._display.symbol(',')] : [];

        if (this._isObject(value)) {
          ownedRows.push(...this._object(value, {...extras, ...{indent: extras.indent + 1, prefix, suffix, collapsible: true}}));
        } else if (Array.isArray(value)) {
          ownedRows.push(...this._array(value, {...extras, ...{indent: extras.indent + 1, prefix, suffix, collapsible: true}}));
        } else {
          ownedRows.push(new _JSONViewerElementRow(this._elements.display, this._display.value(value), {...extras, ...{indent: extras.indent + 1, prefix, suffix}}));
        }
      }

      return ownedRows;
    });
  }

  /** @param {Extras} [extras={}] */
  _array(array, extras = {}) {
    return this._collapsible('[', ']', extras, (extras) => {
      const ownedRows = [];

      for (let i = 0; i < array.length; ++i) {
        const element = array[i];

        const suffix = i + 1 < array.length ? [this._display.symbol(',')] : [];

        if (this._isObject(element)) {
          ownedRows.push(...this._object(element, {...extras, ...{indent: extras.indent + 1, suffix, collapsible: true}}));
        } else if (Array.isArray(element)) {
          ownedRows.push(...this._array(element, {...extras, ...{indent: extras.indent + 1, suffix, collapsible: true}}));
        } else {
          ownedRows.push(new _JSONViewerElementRow(this._elements.display, this._display.value(element), {...extras, ...{indent: extras.indent + 1, suffix}}));
        }
      }

      return ownedRows;
    });
  }
}

class _JSONViewerElementRow {
  _indentBy = 2;
  _collapsible = false;

  /** @type {null|'user'|_JSONViewerElementRow} */
  _collapsedBy = null;

  /** @type {_JSONViewerElementRow[]} */
  _ownedRows = [];

  _elements = {
    row: null,
    sidebar: null,
    indent: null,
    prefix: null,
    container: null,
    suffix: null,
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

    this._elements.prefix = document.createElement('span');
    this._elements.prefix.append(...(extras.prefix ?? []));
    this._elements.row.append(this._elements.prefix);

    this._elements.container = document.createElement('span');
    this._elements.container.append(content);
    this._elements.row.append(this._elements.container);

    this._elements.suffix = document.createElement('span');
    this._elements.suffix.append(...(extras.suffix ?? []));
    this._elements.row.append(this._elements.suffix);

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

window.addEventListener('DOMContentLoaded', () => customElements.define('json-viewer', JSONViewerElement));