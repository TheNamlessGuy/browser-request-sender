const Opts = {
  _default: {
    _v: null,
    templates: [],
  },

  _v: () => browser.runtime.getManifest().version,

  init: async function() {
    Opts._default._v = Opts._v();
    let {opts, changed} = await BookmarkOpts.init(Opts._default);

    const currentVersion = Opts._v();
    const optsVersion = opts._v ?? '0.0.0';

    if (currentVersion > optsVersion) {
      opts._v = currentVersion;
      changed = true;
    }

    if (changed) {
      Opts.set(opts);
    }
  },

  get: async function() {
    const opts = await BookmarkOpts.get();
    if (opts != null && Object.keys(opts).length > 0) {
      return opts;
    }

    await Opts.init();
    return await Opts.get();
  },

  set: async function(opts, extras = {}) {
    await BookmarkOpts.set(opts, extras);
  },
}