require.config({
  baseUrl: "./",
  paths: {
    mocha: "../bower_components/mocha/mocha",
    chai: "../bower_components/chai/chai",
    "just.randomstring": "../bower_components/just.randomstring/just.randomstring"
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
  require(
    ["./js/Object", "./js/Error", "./js/Function", "./js/syntax",
     "./_private/util",
     "./I/AbstractContract", "./I/AbstractError", "./I/ConditionError", "./I/ConditionMetaError",
     "./I/ConditionViolation", "./I/Contract", "./I/ContractError", "./I/ContractFunction",
     "./I/ExceptionConditionViolation", "./I/PostconditionViolation", "./I/PreconditionViolation"],
    function() {
      mocha.run();
    }
  );
});
