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

function conditionReport(condition, self, args) {
  "use strict";

  return self + "." + condition + (args ? (" (" + Array.prototype.join.call(args, ", ") + ")") : " ()");
}

function ConditionError(condition, self, args) {
  "use strict";

  Error.call(this, condition && conditionReport(condition, self, args));
  this.condition = condition;
  this.self = self;
  this.args = args;
  // MUDO seal freeze
}

ConditionError.prototype = new Error();
ConditionError.prototype.constructor = ConditionError;
ConditionError.prototype.condition = null;
ConditionError.prototype.self = null;
ConditionError.prototype.args = null;
ConditionError.prototype.report = function() {
  "use strict";

  return conditionReport(this.condition, this.self, this.args);
};

module.exports = ConditionError;
