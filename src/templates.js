const Templates = {
  /**
   * @typedef Template
   * @property {string} name
   * @property {'GET'|'HEAD'|'POST'|'PUT'|'DELETE'|'CONNECT'|'OPTIONS'|'TRACE'|'PATCH'} httpRequestMethod
   * @property {string} url
   * @property {{key: string, value: string}[]} headers
   * @property {{key: string, value: string}[]} body
   * @property {'text'|'json'|'svg'} responseType
   */

  getAll: async function() {
    const opts = await Opts.get();
    return JSON.parse(JSON.stringify(opts.templates));
  },

  get: async function(name) {
    const opts = await Opts.get();
    const idx = Templates._indexOf(opts, name);
    return idx === -1 ? null : opts.templates[idx];
  },

  /** @param {Template} template */
  add: async function(template) {
    const opts = await Opts.get();

    const idx = Templates._indexOf(opts, template.name);
    if (idx !== -1) {
      return {errors: [`A template with the name '${template.name}' already exists`]};
    }

    opts.templates.push(template);

    await Opts.set(opts);
  },

  /** @param {string} name */
  delete: async function(name) {
    const opts = await Opts.get();

    const idx = Templates._indexOf(opts, name);
    if (idx !== -1) {
      opts.templates.splice(idx, 1);
    }

    await Opts.set(opts);
  },

  _indexOf: function(opts, name) {
    return opts.templates.findIndex(x => x.name === name);
  },
};