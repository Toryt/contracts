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

define(["intern/lib/reporters/Pretty"], function(Pretty) { // jshint ignore:line
  "use strict";

  var doNotReportOn = ["✓", "~"];
  //noinspection MagicNumberJS
  var maxLineLength = 80;

  /**
   * Intern reporter, based on <code>Pretty</code>, that does not report on successful tests, but only on error or fatal (!),
   * or test failures (×), but not on passed (✓) or skipped (~) tests.
   * We only overwrite the <code>runEnd</code> method.
   */
  function PrettyNoSuccess(config) {
    //noinspection JSCheckFunctionSignatures
    Pretty.apply(this, arguments);
    this.showProgress = config && config.showProgress;
    this.wroteCharsOnCharmLine = 0;
  }

  PrettyNoSuccess.prototype = new Pretty();

  PrettyNoSuccess.prototype.newCharmLine = function(times) {
    if (this.showProgress) {
      for (var i = 0; i < times; i++) {
        this.charm.write("\n");
      }
      this.wroteCharsOnCharmLine = 0;
    }
  };

  PrettyNoSuccess.prototype.writeOnCharm = function(symbol) {
    if (this.showProgress) {
      if (this.wroteCharsOnCharmLine >= maxLineLength) {
        this.newCharmLine(1);
      }
      this.charm.write(symbol);
      this.wroteCharsOnCharmLine++;
    }
  };

  PrettyNoSuccess.prototype.runEnd = function() {
    var originalThisLog = this.log;
    this.log = originalThisLog.filter(function(line) {return doNotReportOn.indexOf(line.charAt(0)) < 0;});
    this.newCharmLine(3);
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.runEnd.apply(this, arguments);
    this.log = originalThisLog;
  };

  PrettyNoSuccess.prototype.suiteStart = function() {
    this.newCharmLine(1);
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.suiteStart.apply(this, arguments);
  };

  PrettyNoSuccess.prototype.testSkip = function(test) {
    this.writeOnCharm("~");
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.testSkip.apply(this, arguments);
  };

  PrettyNoSuccess.prototype.testPass = function(test) {
    this.writeOnCharm("✓");
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.testPass.apply(this, arguments);
  };

  PrettyNoSuccess.prototype.testFail = function(test) {
    this.writeOnCharm("×");
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.testFail.apply(this, arguments);
  };

  PrettyNoSuccess.prototype.fatalError = function(error) {
    this.writeOnCharm("!");
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.fatalError.apply(this, arguments);
  };

  PrettyNoSuccess.prototype.deprecated = function(name, replacement, extra) {
    this.writeOnCharm("⚠");
    //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
    Pretty.prototype.deprecated.apply(this, arguments);
  };

  return PrettyNoSuccess;


});
