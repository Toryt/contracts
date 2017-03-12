require.config({
  baseUrl: "./",
  paths: {
    mocha: "../bower_components/mocha/mocha",
    chai: "../bower_components/chai/chai"
  },
  shim: {
    "mocha": {
      exports: "mocha",
      init: function() {
        this.mocha.setup("bdd");
        this.mocha.checkLeaks();
        this.mocha.globals([]);
        return this.mocha;
      }
    }
  }
});

require(["mocha"], function(mocha) {
  require(["./js/Function"], function() {
    mocha.run();
  });
});
