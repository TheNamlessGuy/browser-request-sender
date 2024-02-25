const Background = {
  main: async function() {
    await Communication.init();
    await Opts.init();
    await ContextMenus.init();
  },
};

Background.main();