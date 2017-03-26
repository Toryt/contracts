define(["intern/lib/reporters/Pretty"], function(Pretty) { // jshint ignore:line
  "use strict";

  var doNotReportOn = ["✓", "~"];

  /**
   * Intern reporter, based on <code>Pretty</code>, that does not report on successful tests, but only on error or fatal (!),
   * or test failures (×), but not on passed (✓) or skipped (~) tests.
   * We only overwrite the <code>runEnd</code> method.
   */
  function PrettyNoSuccess() {
    Pretty.apply(this, arguments);
  }

  PrettyNoSuccess.prototype = new Pretty();
  PrettyNoSuccess.prototype.runEnd = function() {
    var originalThisLog = this.log;
    this.log = originalThisLog.filter(function(line) {return doNotReportOn.indexOf(line.charAt(0)) < 0;});
    //noinspection JSUnresolvedFunction,JSCheckFunctionSignatures
    Pretty.prototype.runEnd.apply(this, arguments);
    this.log = originalThisLog;
  };

  return PrettyNoSuccess;


});
