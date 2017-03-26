/*
 Copyright 2017 - 2017 by Jan Dockx

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

(function(factory) {
  "use strict";

  var dependencies = ["𝕋合同/_private/util"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(util) {
  "use strict";

  /*jshint multistr: true */
  var stacks = {
    node: "    at defineErrorRecursively (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:448:20)" + util.eol +
          "    at Suite.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:465:19)" + util.eol +
          "    at Object.create (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)" + util.eol +
          "    at context.describe.context.context (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)" + util.eol +
          "    at Suite.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:443:7)" + util.eol +
          "    at Object.create (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)" + util.eol +
          "    at context.describe.context.context (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)" + util.eol +
          "    at /Users/username/DevDirectory/contracts/test/_private/utilTest.js:71:5" + util.eol +
          "    at expect (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:27:30)" + util.eol +
          "    at Object.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:29:2)" + util.eol +
          "    at Module._compile (module.js:570:32)" + util.eol +
          "    at Object.Module._extensions..js (module.js:579:10)" + util.eol +
          "    at Module.load (module.js:487:32)" + util.eol +
          "    at tryModuleLoad (module.js:446:12)" + util.eol +
          "    at Function.Module._load (module.js:438:3)" + util.eol +
          "    at Module.require (module.js:497:17)" + util.eol +
          "    at require (internal/module.js:20:19)" + util.eol +
          "    at /Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:222:27" + util.eol +
          "    at Array.forEach (native)" + util.eol +
          "    at Mocha.loadFiles (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:219:14)" + util.eol +
          "    at Mocha.run (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:487:10)" + util.eol +
          "    at Object.<anonymous> (/Users/username/DevDirectory/contracts/node_modules/mocha/bin/_mocha:459:18)" + util.eol +
          "    at Module._compile (module.js:570:32)" + util.eol +
          "    at Object.Module._extensions..js (module.js:579:10)" + util.eol +
          "    at Module.load (module.js:487:32)" + util.eol +
          "    at tryModuleLoad (module.js:446:12)" + util.eol +
          "    at Function.Module._load (module.js:438:3)" + util.eol +
          "    at Module.runMain (module.js:604:10)" + util.eol +
          "    at run (bootstrap_node.js:394:7)" + util.eol +
          "    at startup (bootstrap_node.js:149:9)" + util.eol +
          "    at bootstrap_node.js:509:3",

    chrome: "    at defineErrorRecursively (http://localhost:63342/contracts/test/_private/utilTest.js:448:20)" + util.eol +
            "    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:465:19)" + util.eol +
            "    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)" + util.eol +
            "    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)" + util.eol +
            "    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:443:7)" + util.eol +
            "    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)" + util.eol +
            "    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)" + util.eol +
            "    at Object.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:71:5)" + util.eol +
            "    at Object.execCb (http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:33)" + util.eol +
            "    at Module.check (http://localhost:63342/contracts/bower_components/requirejs/require.js:883:51)",

    firefox: "defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilTest.js:448:20" + util.eol +
             "@http://localhost:63342/contracts/test/_private/utilTest.js:465:19" + util.eol +
             "create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11" + util.eol +
             "[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14" + util.eol +
             "@http://localhost:63342/contracts/test/_private/utilTest.js:443:7" + util.eol +
             "create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11" + util.eol +
             "[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14" + util.eol +
             "@http://localhost:63342/contracts/test/_private/utilTest.js:71:5" + util.eol +
             "newContext/context.execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:24" + util.eol +
             "newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:43" + util.eol +
             "newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29" + util.eol +
             "bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20" + util.eol +
             "newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21" + util.eol +
             "each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31" + util.eol +
             "newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17" + util.eol +
             "newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25" + util.eol +
             "newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29" + util.eol +
             "bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20" + util.eol +
             "newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21" + util.eol +
             "each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31" + util.eol +
             "newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17" + util.eol +
             "newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25" + util.eol +
             "newContext/Module.prototype.enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:17" + util.eol +
             "newContext/Module.prototype.init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:21" + util.eol +
             "callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:17" + util.eol +
             "newContext/context.completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:21" + util.eol +
             "newContext/context.onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:21",

    safari: "defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilTest.js:448:29" + util.eol +
            "http://localhost:63342/contracts/test/_private/utilTest.js:465:41" + util.eol +
            "create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23" + util.eol +
            "http://localhost:63342/contracts/test/_private/utilTest.js:443:15" + util.eol +
            "create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23" + util.eol +
            "http://localhost:63342/contracts/test/_private/utilTest.js:71:13" + util.eol +
            "execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:38" + util.eol +
            "check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:57" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23" + util.eol +
            "each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35" + util.eol +
            "emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21" + util.eol +
            "check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28" + util.eol +
            "http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23" + util.eol +
            "each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35" + util.eol +
            "emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21" + util.eol +
            "check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34" + util.eol +
            "enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:27" + util.eol +
            "init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:32" + util.eol +
            "callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:67" + util.eol +
            "completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:34" + util.eol +
            "onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:41"
  };

  stacks["current environment"] = (new Error()).stack.split(util.eol).splice(1).join(util.eol);

  return stacks;
}));
