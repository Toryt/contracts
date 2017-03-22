require.config({
  baseUrl: "../",
  packages: [
    {name: "𝕋合同", location: "src"},
    {name: "test", location: "test"}
  ],
  paths: {
    mocha: "bower_components/mocha/mocha",
    chai: "bower_components/chai/chai",
    "just.randomstring": "bower_components/just.randomstring/just.randomstring"
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
    },
    "just.randomstring": {
      exports: "just.randomstring"
    }
  }
});

require(["mocha"], function(mocha) {
  require(["test/js/mochaTests", "test/_private/mochaTests", "test/I/mochaTests"], function() {
    mocha.run();
  });
});
