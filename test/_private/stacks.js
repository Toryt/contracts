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

import { eol } from '../../src/_private/util'

export const node = '    at defineErrorRecursively (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:448:20)' + eol +
  '    at Suite.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:465:19)' + eol +
  '    at Object.create (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)' + eol +
  '    at context.describe.context.context (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)' + eol +
  '    at Suite.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:443:7)' + eol +
  '    at Object.create (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/common.js:114:19)' + eol +
  '    at context.describe.context.context (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/interfaces/bdd.js:44:27)' + eol +
  '    at /Users/username/DevDirectory/contracts/test/_private/utilTest.js:71:5' + eol +
  '    at expect (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:27:30)' + eol +
  '    at Object.<anonymous> (/Users/username/DevDirectory/contracts/test/_private/utilTest.js:29:2)' + eol +
  '    at Module._compile (module.js:570:32)' + eol +
  '    at Object.Module._extensions..js (module.js:579:10)' + eol +
  '    at Module.load (module.js:487:32)' + eol +
  '    at tryModuleLoad (module.js:446:12)' + eol +
  '    at Function.Module._load (module.js:438:3)' + eol +
  '    at Module.require (module.js:497:17)' + eol +
  '    at require (internal/module.js:20:19)' + eol +
  '    at /Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:222:27' + eol +
  '    at Array.forEach (native)' + eol +
  '    at Mocha.loadFiles (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:219:14)' + eol +
  '    at Mocha.run (/Users/username/DevDirectory/contracts/node_modules/mocha/lib/mocha.js:487:10)' + eol +
  '    at Object.<anonymous> (/Users/username/DevDirectory/contracts/node_modules/mocha/bin/_mocha:459:18)' + eol +
  '    at Module._compile (module.js:570:32)' + eol +
  '    at Object.Module._extensions..js (module.js:579:10)' + eol +
  '    at Module.load (module.js:487:32)' + eol +
  '    at tryModuleLoad (module.js:446:12)' + eol +
  '    at Function.Module._load (module.js:438:3)' + eol +
  '    at Module.runMain (module.js:604:10)' + eol +
  '    at run (bootstrap_node.js:394:7)' + eol +
  '    at startup (bootstrap_node.js:149:9)' + eol +
  '    at bootstrap_node.js:509:3'

export const chrome = '    at defineErrorRecursively (http://localhost:63342/contracts/test/_private/utilTest.js:448:20)' + eol +
  '    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:465:19)' + eol +
  '    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)' + eol +
  '    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)' + eol +
  '    at Suite.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:443:7)' + eol +
  '    at Object.create (http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:19)' + eol +
  '    at context.describe.context.context (http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:27)' + eol +
  '    at Object.<anonymous> (http://localhost:63342/contracts/test/_private/utilTest.js:71:5)' + eol +
  '    at Object.execCb (http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:33)' + eol +
  '    at Module.check (http://localhost:63342/contracts/bower_components/requirejs/require.js:883:51)'

export const firefox = 'defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilTest.js:448:20' + eol +
  '@http://localhost:63342/contracts/test/_private/utilTest.js:465:19' + eol +
  'create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11' + eol +
  '[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14' + eol +
  '@http://localhost:63342/contracts/test/_private/utilTest.js:443:7' + eol +
  'create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:11' + eol +
  '[8]</module.exports/</context.context@http://localhost:63342/contracts/bower_components/mocha/mocha.js:744:14' + eol +
  '@http://localhost:63342/contracts/test/_private/utilTest.js:71:5' + eol +
  'newContext/context.execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:24' + eol +
  'newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:43' + eol +
  'newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29' + eol +
  'bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20' + eol +
  'newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21' + eol +
  'each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31' + eol +
  'newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17' + eol +
  'newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25' + eol +
  'newContext/Module.prototype.enable/</<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:29' + eol +
  'bind/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:134:20' + eol +
  'newContext/Module.prototype.emit/<@http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:21' + eol +
  'each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:31' + eol +
  'newContext/Module.prototype.emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:17' + eol +
  'newContext/Module.prototype.check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:25' + eol +
  'newContext/Module.prototype.enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:17' + eol +
  'newContext/Module.prototype.init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:21' + eol +
  'callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:17' + eol +
  'newContext/context.completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:21' + eol +
  'newContext/context.onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:21'

export const safari = 'defineErrorRecursively@http://localhost:63342/contracts/test/_private/utilTest.js:448:29' + eol +
  'http://localhost:63342/contracts/test/_private/utilTest.js:465:41' + eol +
  'create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23' + eol +
  'http://localhost:63342/contracts/test/_private/utilTest.js:443:15' + eol +
  'create@http://localhost:63342/contracts/bower_components/mocha/mocha.js:931:23' + eol +
  'http://localhost:63342/contracts/test/_private/utilTest.js:71:13' + eol +
  'execCb@http://localhost:63342/contracts/bower_components/requirejs/require.js:1696:38' + eol +
  'check@http://localhost:63342/contracts/bower_components/requirejs/require.js:883:57' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23' + eol +
  'each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35' + eol +
  'emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21' + eol +
  'check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:1139:39' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:134:28' + eol +
  'http://localhost:63342/contracts/bower_components/requirejs/require.js:1189:23' + eol +
  'each@http://localhost:63342/contracts/bower_components/requirejs/require.js:59:35' + eol +
  'emit@http://localhost:63342/contracts/bower_components/requirejs/require.js:1188:21' + eol +
  'check@http://localhost:63342/contracts/bower_components/requirejs/require.js:938:34' + eol +
  'enable@http://localhost:63342/contracts/bower_components/requirejs/require.js:1176:27' + eol +
  'init@http://localhost:63342/contracts/bower_components/requirejs/require.js:788:32' + eol +
  'callGetModule@http://localhost:63342/contracts/bower_components/requirejs/require.js:1203:67' + eol +
  'completeLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1590:34' + eol +
  'onScriptLoad@http://localhost:63342/contracts/bower_components/requirejs/require.js:1717:41'

export const currentEnvironment = (new Error()).stack.split(eol).splice(1).join(eol)
