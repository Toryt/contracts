(function(factory) {
  "use strict";

  var dependencies = [];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function() {
  "use strict";

  /*jshint multistr: true */
  return {
    node: "    at defineErrorRecursively (/Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:448:20)\
    at Suite.<anonymous> (/Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:465:19)\
    at Object.create (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)\
    at context.describe.context.context (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)\
    at Suite.<anonymous> (/Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:443:7)\
    at Object.create (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)\
    at context.describe.context.context (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)\
    at /Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:71:5\
    at expect (/Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:27:30)\
    at Object.<anonymous> (/Users/jand/Scratchpad/contracts/test/_private/utilMochaTest.js:29:2)\
    at Module._compile (module.js:570:32)\
    at Object.Module._extensions..js (module.js:579:10)\
    at Module.load (module.js:487:32)\
    at tryModuleLoad (module.js:446:12)\
    at Function.Module._load (module.js:438:3)\
    at Module.require (module.js:497:17)\
    at require (internal/module.js:20:19)\
    at /Users/jand/Scratchpad/contracts/node_modules/mocha/lib/mocha.js:222:27\
    at Array.forEach (native)\
    at Mocha.loadFiles (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/mocha.js:219:14)\
    at Mocha.run (/Users/jand/Scratchpad/contracts/node_modules/mocha/lib/mocha.js:487:10)\
    at Object.<anonymous> (/Users/jand/Scratchpad/contracts/node_modules/mocha/bin/_mocha:459:18)\
    at Module._compile (module.js:570:32)\
    at Object.Module._extensions..js (module.js:579:10)\
    at Module.load (module.js:487:32)\
    at tryModuleLoad (module.js:446:12)\
    at Function.Module._load (module.js:438:3)\
    at Module.runMain (module.js:604:10)\
    at run (bootstrap_node.js:394:7)\
    at startup (bootstrap_node.js:149:9)\
    at bootstrap_node.js:509:3",

    chrome: "    at defineErrorRecursively (http://localhost:63342/contracts/test/_private/utilMochaTest.js:448:20)\
    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilMochaTest.js:465:19)\
    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)\
    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)\
    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilMochaTest.js:443:7)\
    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)\
    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)\
    at Object.<anonymous> (http://localhost:63342/contracts/test/_private/utilMochaTest.js:71:5)\
    at Object.execCb (http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:33)\
    at Module.check (http://localhost:63342/contracts/bower_components/requirejs/require.js:883:51)",

    firefox: "defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilMochaTest.js:448:20\
@http://localhost:63342/contracts/test/_private/utilMochaTest.js:465:19\
create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11\
[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14\
@http://localhost:63342/contracts/test/_private/utilMochaTest.js:443:7\
create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11\
[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14\
@http://localhost:63342/contracts/test/_private/utilMochaTest.js:71:5\
newContext/context.execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:24\
newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:43\
newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29\
bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20\
newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21\
each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31\
newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17\
newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25\
newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29\
bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20\
newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21\
each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31\
newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17\
newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25\
newContext/Module.prototype.enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:17\
newContext/Module.prototype.init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:21\
callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:17\
newContext/context.completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:21\
newContext/context.onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:21",

    safari: "defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilMochaTest.js:448:29\
http://localhost:63342/contracts/test/_private/utilMochaTest.js:465:41\
create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23\
http://localhost:63342/contracts/test/_private/utilMochaTest.js:443:15\
create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23\
http://localhost:63342/contracts/test/_private/utilMochaTest.js:71:13\
execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:38\
check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:57\
http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39\
http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28\
http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23\
each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35\
emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21\
check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34\
http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39\
http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28\
http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23\
each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35\
emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21\
check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34\
enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:27\
init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:32\
callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:67\
completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:34\
onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:41"
  };
}));
