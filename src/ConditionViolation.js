/*
 Copyright 2016 - 2016 by Jan Dockx

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

module.exports = (function() {
  "use strict";

  var ConditionError = require("./ConditionError");
  var util = require("./util");

  function ConditionViolation(condition, self, args) {
    this._pre(function() {return util.typeOf(condition) === "function";});
    this._pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionError.apply(this, arguments);
  }

  ConditionViolation.prototype = new ConditionError(
    function() {return "This is a dummy condition in the ConditionViolation prototype."},
    undefined,
    []
  );
  ConditionViolation.prototype.constructor = ConditionViolation;
  ConditionViolation.prototype.name = "Contract Condition Violation";

  ConditionViolation.createMessage = function(condition, self, args) {
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    return "Condition " + condition +
           " was violated while function " + "A FUNCTION" +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")";
  };

  return ConditionViolation;
})();
