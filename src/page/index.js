const BackgroundPage = {
  _port: null,

  init: function() {
    BackgroundPage._port = browser.runtime.connect();
  },

  send: function(action, extras = {}) {
    return new Promise((resolve) => {
      const listener = (response) => {
        if (response.response === action) {
          BackgroundPage._port.onMessage.removeListener(listener);
          resolve(response);
        }
      };

      BackgroundPage._port.onMessage.addListener(listener);
      BackgroundPage._port.postMessage({action: action, ...JSON.parse(JSON.stringify(extras))});
    });
  },

  getTemplates: async function() {
    return (await BackgroundPage.send('get-templates')).results;
  },

  getTemplate: async function(name) {
    return (await BackgroundPage.send('get-template', {name})).results;
  },

  addTemplate: async function(template) {
    return await BackgroundPage.send('add-template', {template});
  },

  deleteTemplate: async function(name) {
    await BackgroundPage.send('delete-template', {name});
  },
};

const get = {
  element: {
    errors: function() { return document.getElementById('errors'); },
    url: function() { return document.getElementById('url'); },
    headers: function() { return document.getElementById('data').getTab('header').body; },
    body: function() { return document.getElementById('data').getTab('body').body; },
    response: function() { return document.getElementById('response'); }
  },

  url: function() { return get.element.url().url; },
  httpRequestMethod: function() { return get.element.url().httpRequestMethod; },
};

const Template = {
  add: function() {
    InputModalElement.open({
      placeholder: 'Template name',
      onValidation: (elem) => elem.value === '' ? ['You can\'t have an empty template name'] : null,
      onOK: async (elem) => {
        let body = get.element.body();
        if (body instanceof KeyValueTableElement) {
          body = body.asArray();
        }

        const response = await BackgroundPage.addTemplate({
          name: elem.value,
          httpRequestMethod: get.httpRequestMethod(),
          url: get.url(),
          headers: get.element.headers().asArray(),
          body: body,
          responseType: get.element.response().type,
        });

        if (response.errors?.length > 0) {
          get.element.errors().addAll(...response.errors);
        }

        await Template.setSelections();
      },
    });
  },

  load: async function(name) {
    const template = await BackgroundPage.getTemplate(name);

    get.element.errors().clear();
    get.element.url().url = template.url;
    get.element.url().httpRequestMethod = template.httpRequestMethod;
    get.element.response().clear();
    get.element.response().type = template.responseType;

    const header = get.element.headers();
    header.clear();
    for (const h of template.headers) {
      header.addRow(h);
    }

    const body = get.element.body();
    if (body instanceof KeyValueTableElement) {
      body.clear();
      for (const b of template.body) {
        body.addRow(b);
      }
    }
  },

  setSelections: async function() {
    const templates = await BackgroundPage.getTemplates();
    const container = document.getElementById('template-container');
    Array.from(container.children).forEach(x => x.remove());
    for (const template of templates) {
      const element = document.createElement('template-selection');
      element.name = template.name;
      element.addEventListener('delete-me', async () => {
        await BackgroundPage.deleteTemplate(template.name);
        await Template.setSelections();
      });
      element.addEventListener('select-me', async () => Template.load(template.name));
      container.append(element);
    }
  },
}

async function send() {
  get.element.errors().clear();

  let url = get.url();
  try {
    new URL(url);
  } catch {
    get.element.errors().add('URL is not valid');
    return;
  }

  get.element.response().clear();

  const inflights = [document.getElementById('send-btn')];
  inflights.forEach(x => x.disabled = true);

  const payload = {
    method: get.httpRequestMethod(),
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow',
  };

  const body = get.element.body();

  payload.headers = get.element.headers().asJSON();

  if (['GET', 'HEAD'].includes(payload.method)) {
    if (body instanceof KeyValueTableElement) {
      const parsed = new URL(url);
      const bodyData = body.asArray();
      for (const row of bodyData) {
        parsed.searchParams.set(row.key, row.value);
      }
      url = parsed.toString();
    }
  } else {
    if (body instanceof KeyValueTableElement) {
      payload.body = JSON.stringify(body.asJSON());
    }
  }

  get.element.response().loading = true;
  const request = await fetch(url, payload).catch(e => e);
  if (request instanceof Error) {
    get.element.errors().add(`${request}`);
  } else {
    get.element.response().set(await request.text());
  }
  get.element.response().loading = false;

  inflights.forEach(x => x.disabled = false);
}

window.addEventListener('DOMContentLoaded', async () => {
  BackgroundPage.init();

  get.element.url().addEventListener('params-found', (e) => {
    const body = get.element.body();
    if (body instanceof KeyValueTableElement) {
      e.detail.forEach(x => body.setOrAddRow(x));
    }
  });

  document.getElementById('send-btn').addEventListener('click', send);
  document.getElementById('save-as-template-btn').addEventListener('click', Template.add);

  await Template.setSelections();

  get.element.headers().addRow();
  if (get.element.body() instanceof KeyValueTableElement) {
    get.element.body().addRow();
  }
});