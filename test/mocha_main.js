/*
 Copyright 2015 - 2017 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* This file sets up Mocha browser testing. It is used in mocha.html */
//noinspection JSFileReferences
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
        this.mocha.setup("bdd"); // jshint ignore:line
        this.mocha.checkLeaks();
        this.mocha.globals([]);
        return this.mocha;
      }
    },
    "just.randomstring": {
      exports: "just.randomstring"
    }
  },
  map: {
    test: {
      "test/_util/describe": "test/_util/mocha-amd/describe",
      "test/_util/it": "test/_util/mocha-amd/it",
      "test/_util/expect": "test/_util/mocha-amd/expect"
    }
  }
});

require(["mocha"], function(mocha) {
  require(["test/js/mochaTests", "test/_private/mochaTests", "test/I/mochaTests"], function() { // jshint ignore:line
    mocha.run();
  });
});
