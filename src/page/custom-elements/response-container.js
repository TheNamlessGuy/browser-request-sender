class ResponseContainerElement extends HTMLElement {
  _currentType = null;

  _elements = {
    type: null,

    bodies: {
      text: null,
      json: null,
      xml: null,
      svg: null,
      loading: null,
    },
  };

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

.container {
  background-color: var(--active-color);
  border: 1px solid var(--text-color);
  border-radius: 5px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  height: 100%;
}

.loading {
  display: flex;
  justify-content: space-around;
}

.text {
  font-family: monospace;
}

textarea {
  border: none;
  height: 100%;
}
`;

    const container = document.createElement('div');
    container.classList.add('container');

    const header = document.createElement('h1');
    header.innerText = 'Response';
    container.append(header);

    this._elements.type = LabeledSelectElement.create({
      label: 'Type',
      onChange: () => this._onTypeChange(this._elements.type.value),
      options: [
        {value: 'text', display: 'Text'},
        {value: 'json', display: 'JSON', selected: true},
        {value: 'xml', display: 'XML'},
        {value: 'svg', display: 'SVG'},
      ],
    });
    container.append(this._elements.type);

    container.append(document.createElement('hr'));

    this._elements.bodies.text = document.createElement('div');
    this._elements.bodies.text.classList.add('text');
    this._elements.bodies.text.style.display = 'none';
    container.append(this._elements.bodies.text);

    this._elements.bodies.json = document.createElement('json-viewer');
    this._elements.bodies.json.style.display = 'none';
    container.append(this._elements.bodies.json);

    this._elements.bodies.xml = document.createElement('xml-viewer');
    this._elements.bodies.xml.style.display = 'none';
    container.append(this._elements.bodies.xml);

    this._elements.bodies.svg = document.createElement('svg-viewer');
    this._elements.bodies.svg.style.display = 'none';
    container.append(this._elements.bodies.svg);

    this._elements.bodies.loading = document.createElement('div');
    this._elements.bodies.loading.classList.add('loading');
    this._elements.bodies.loading.style.display = 'none';
    const loadingImage = document.createElement('img');
    loadingImage.src = '/res/images/loading.apng';
    this._elements.bodies.loading.append(loadingImage);
    container.append(this._elements.bodies.loading);

    this._currentType = this._elements.type.value;
    this._onTypeChange(this._elements.type.value);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  clear(type = null) {
    type = type ?? this.type;

    if (['json', 'xml', 'svg'].includes(type)) {
      this._elements.bodies[type].clear();
    } else {
      this.set('', type);
    }
  }

  get(type = null) {
    type = type ?? this.type;

    if (type === 'text') {
      return this._elements.bodies.text.innerText;
    } else {
      return this._elements.bodies[type].value;
    }
  }

  set(data, type = null) {
    type = type ?? this.type;

    if (type === 'text') {
      this._elements.bodies.text.innerText = data;
    } else {
      this._elements.bodies[type].value = data;
    }
  }

  get type() { return this._currentType; }
  set type(type) { this._onTypeChange(type); }

  _loading = false;
  get loading() { return this._loading; }
  set loading(loading) {
    this._loading = loading;
    this._elements.bodies.loading.style.display = loading ? null : 'none';
    this._elements.bodies[this._currentType].style.display = loading ? 'none' : null;
  }

  _onTypeChange(type) {
    const previous = this._currentType;
    this._currentType = type;
    this._elements.type.value = this._currentType;

    this._elements.bodies[previous].style.display = 'none';
    if (!this._loading) { this._elements.bodies[type].style.display = null; }

    this.set(this.get(previous));
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('response-container', ResponseContainerElement));