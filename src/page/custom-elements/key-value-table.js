class KeyValueTableElement extends HTMLElement {
  _elements = {
    table: null,
    rows: [],
  };

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

button {
  width: 100%;
}
button.add-row {
  margin-top: 10px;
}

.table {
  display: grid;
  grid-template-columns: max-content auto auto;
}

.cell {
  border-radius: 0;
  margin-bottom: 5px;
  padding-right: 5px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.cell.header {
  border-bottom: 1px solid var(--text-color);
  margin-bottom: 5px;
  padding-bottom: 5px;
  justify-content: left;
}

.cell.actions {
  text-align: center;
}

input {
  height: 26px;
  font-size: 16px;
}
`;

    const container = document.createElement('div');
    container.classList.add('container');

    this._elements.table = document.createElement('div');
    this._elements.table.classList.add('table');
    container.append(this._elements.table);

    let header = document.createElement('div');
    header.classList.add('header', 'cell');
    header.innerText = '';
    this._elements.table.append(header);
    header = document.createElement('div');
    header.classList.add('header', 'cell');
    header.innerText = 'Key';
    this._elements.table.append(header);
    header = document.createElement('div');
    header.classList.add('header', 'cell');
    header.innerText = 'Value';
    this._elements.table.append(header);

    const addRowButton = document.createElement('button');
    addRowButton.classList.add('add-row');
    addRowButton.innerText = 'Add row';
    addRowButton.addEventListener('click', function() { this.addRow(); }.bind(this));
    container.append(addRowButton);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  clear() {
    while (this._elements.rows.length > 0) {
      this._removeRow(this._elements.rows[0]);
    }
  }

  _removeRow(row) {
    row.actions.remove();
    row.key.remove();
    row.value.remove();
    this._elements.rows.splice(this._elements.rows.indexOf(row), 1);
  }

  /** @param {{key: string, value: string}|null} [data=null] */
  addRow(data = null) {
    const actions = document.createElement('div');
    actions.classList.add('cell', 'actions');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '🗑';
    deleteBtn.classList.add('red');
    deleteBtn.addEventListener('click', () => this._removeRow(row));
    actions.append(deleteBtn);

    const key = document.createElement('input');
    key.classList.add('cell');
    key.value = data?.key ?? '';

    const value = document.createElement('input');
    value.classList.add('cell');
    value.value = data?.value ?? '';

    const row = {actions, key, value};

    this._elements.table.append(actions, key, value);
    this._elements.rows.push(row);
  }

  /** @param {{key: string, value: string}} data */
  setOrAddRow(data) {
    let emptyRow = null;
    for (const row of this._elements.rows) {
      if (this._rowEmpty(row)) {
        emptyRow = row;
      } else if (row.key.value === data.key && row.value.value === data.value) {
        return; // No thanks
      }
    }

    if (emptyRow) {
      emptyRow.key.value = data.key;
      emptyRow.value.value = data.value;
      return;
    }

    this.addRow(data);
  }

  _rowEmpty(row) {
    return row.key.value.length === 0 && row.value.value.length === 0
  }

  _forEachRow(callback) {
    for (const row of this._elements.rows) {
      if (!this._rowEmpty(row)) {
        callback(row);
      }
    }
  }

  /** @returns {{key: string, value: string}[]} */
  asArray() {
    const retval = [];
    this._forEachRow(row => retval.push({key: row.key.value, value: row.value.value}));
    return retval;
  }

  asJSON() {
    const retval = {};
    this._forEachRow(row => retval[row.key.value] = row.value.value);
    return retval;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('key-value-table', KeyValueTableElement));