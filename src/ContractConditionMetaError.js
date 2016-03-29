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

var ContractConditionError = require("./ContractConditionError");

function ContractConditionMetaError(condition, self, args, error) {
  "use strict";

  ContractConditionError.call(this, condition, self, args);
  this.error = error;
  // MUDO seal freeze
}

ContractConditionMetaError.prototype = new ContractConditionError();
ContractConditionMetaError.prototype.constructor = ContractConditionMetaError;
ContractConditionMetaError.prototype.error = null;

module.exports = ContractConditionMetaError;
