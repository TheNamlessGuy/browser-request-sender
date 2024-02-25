class URLSelectorElement extends HTMLElement {
  _method = null;
  _url = null;

  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
@import url('/src/page/index.css');

.container {
  width: 100%;
  height: fit-content;
  display: flex;
  font-size: 26px;
  margin-bottom: 10px;
}

ez-select::part(select) {
  border-radius: 5px 0 0 5px;
  font-size: inherit;
  padding: 7px;
}

input {
  border-radius: 0 5px 5px 0;
  font-size: inherit;
  flex-grow: 1;
  border-left: none;
  padding: 0 5px;
}
`;

    const container = document.createElement('div');
    container.classList.add('container');

    this._method = EzSelectElement.create({options: [
      {value: 'GET',     display: 'GET'},
      {value: 'HEAD',    display: 'HEAD'},
      {value: 'POST',    display: 'POST'},
      {value: 'PUT',     display: 'PUT'},
      {value: 'DELETE',  display: 'DELETE'},
      {value: 'CONNECT', display: 'CONNECT'},
      {value: 'OPTIONS', display: 'OPTIONS'},
      {value: 'TRACE',   display: 'TRACE'},
      {value: 'PATCH',   display: 'PATCH'},
    ]});
    container.append(this._method);

    this._url = document.createElement('input');
    this._url.placeholder = 'URL...';
    this._url.addEventListener('blur', () => this._noParams());
    container.append(this._url);

    this.attachShadow({mode: 'closed'}).append(style, container);
  }

  get url() {
    return this._url.value;
  }

  set url(url) {
    this._url.value = url;
    this._noParams();
  }

  get httpRequestMethod() {
    return this._method.value;
  }

  set httpRequestMethod(method) {
    this._method.value = method;
  }

  _noParams() {
    let url = this.url;
    try {
      url = new URL(url);
    } catch {
      return; // Whatever
    }

    const params = [];
    for (const [key, value] of url.searchParams) {
      params.push({key, value});
    }

    for (const param of params) {
      url.searchParams.delete(param.key);
    }

    const newURL = url.toString();
    if (newURL !== this.url) {
      this.url = newURL;

      if (params.length > 0) {
        this.dispatchEvent(new CustomEvent('params-found', {detail: params}));
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('url-selector', URLSelectorElement));