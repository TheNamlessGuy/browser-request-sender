const Communication = {
  init: function() {
    browser.runtime.onConnect.addListener(Communication._onConnect);
  },

  _onConnect: function(port) {
    port.onMessage.addListener(async (msg) => {
      if (!(msg.action in Communication._map)) {
        return; // What?
      }

      const response = (await Communication._map[msg.action](msg)) ?? {};
      port.postMessage({response: msg.action, ...JSON.parse(JSON.stringify(response))});
    });
  },

  _map: {
    'get-templates': async function() { return {results: await Templates.getAll()}; },
    'get-template': async function(msg) { return {results: await Templates.get(msg.name)}; },
    'add-template': async function(msg) { return await Templates.add(msg.template); },
    'delete-template': async function(msg) { return await Templates.delete(msg.name); },
  },
};