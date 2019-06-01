/*
 Copyright 2019 - 2019 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

const Contract = require('../lib/IV/Contract')
const cases = require('./_cases')

const contract = new Contract({ pre: [cases.intentionallyFailingFunction] })

describe('mocha this', function () {
  before(function () {
    this.subject = contract.implementation(function () {})
  })

  it('works when a precondition violation occurs when a function is called with a mocha fixture as this', function () {
    this.subject()
  })
})

/* Mocha Context has ctx.customInspect = true
 * The problem is in
 * node_modules/mocha/lib/runnable.js, line 231:
 *
 * /**
 *  * Inspect the runnable void of private properties.
 *  *
 *  * @private
 *  * @return {string}
 *  *-
 *  Runnable.prototype.inspect = function() {
 *    return JSON.stringify(
 *      this,
 *      function(key, val) {
 *        if (key[0] === '_') {
 *          return;
 *        }
 *        if (key === 'parent') {
 *          return '#<Suite>';
 *        }
 *        if (key === 'ctx') {
 *          return '#<Context>';
 *        }
 *        return val;
 *      },
 *      2
 *    );
 *  };
 *
 * `this ` still contains circular structures, apart from what the replacer handles.
 * this.ctx.test === this, but that should be handled by the replacer
 * this.parent.ctx.test === this, but that should be handled by the replacer
 *
 * There seems to be nothing else that can make this happen, except for `this.intellij_test_node`. This seems to be
 * added on by IntelliJ. It is obviously not handled by Mocha itself. This structure has internal loops:
 * this.intellij_test_node.parent.children[0] === this.intellij_test_node
 *
 * This means the bug is in IntelliJ
 */

/* But then, why does npm test fails too?
 * [mocha this]
 *
 *   1) works when a precondition violation occurs when a function is called with a mocha fixture as this
 *
 *      >>> logs: Error: TypeError: Converting circular structure to JSON
 *      >>> logs:     at JSON.stringify (<anonymous>)
 *      >>> logs:     at makeSimple (node_modules/format-error/index.js:36:28)
 *      >>> logs:     at format (node_modules/format-error/index.js:39:21)
 *      >>> logs:     at Runner.<anonymous> (node_modules/mocha-reporter/index.js:283:18)
 *
 * This is an error in mocha-reporter!
 *
 * But without mocha-reporter, it is even weirder:

(node:18037) UnhandledPromiseRejectionWarning: Error: This condition intentionally fails.
    at Object.<anonymous> (/Users/jand/Scratchpad/toryt/contracts/test/_cases.js:51:26)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Module.require (module.js:597:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/jand/Scratchpad/toryt/contracts/test/99.mochaBugTest.js:22:15)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Module.require (module.js:597:17)
    at require (internal/module.js:11:18)
    at /Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/mocha.js:330:36
    at Array.forEach (<anonymous>)
    at Mocha.loadFiles (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/mocha.js:327:14)
    at Mocha.run (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/mocha.js:804:10)
    at Object.exports.singleRun (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/cli/run-helpers.js:207:16)
    at exports.runMocha (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/cli/run-helpers.js:300:13)
    at Object.exports.handler.argv [as handler] (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/cli/run.js:296:3)
    at Object.runCommand (/Users/jand/Scratchpad/toryt/contracts/node_modules/yargs/lib/command.js:242:26)
    at Object.parseArgs [as _parseArgs] (/Users/jand/Scratchpad/toryt/contracts/node_modules/yargs/yargs.js:1087:28)
    at Object.parse (/Users/jand/Scratchpad/toryt/contracts/node_modules/yargs/yargs.js:566:25)
    at Object.exports.main (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/lib/cli/cli.js:63:6)
    at Object.<anonymous> (/Users/jand/Scratchpad/toryt/contracts/node_modules/mocha/bin/_mocha:10:23)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3
(node:18037) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:18037) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
  mocha this
    1) works when a precondition violation occurs when a function is called with a mocha fixture as this
    *
 * Why is there an 'UnhandledPromiseRejectionWarning:'? There is nothing async here?!?!
 */
