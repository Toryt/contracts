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

  /**
   * error must be optional
   * - to make it possible to use this as the prototype for more special types
   * - because in JavaScript, also undefined and null can be thrown
   * Therefor, a ConditionMetaError is also civilized
   */
  function ConditionMetaError(condition, self, args, error) {
    ConditionError.call(this, condition, self, args);
    if (error) {
      Object.freeze(error);
    }
    this._setAndFreezeProperty("error", error);
  }

  ConditionMetaError.prototype = new ConditionError();
  ConditionMetaError.prototype.constructor = ConditionMetaError;
  ConditionMetaError.prototype.name = "Contract Condition Meta-Error";
  ConditionMetaError.prototype.error = null;

  return ConditionMetaError;
})();
