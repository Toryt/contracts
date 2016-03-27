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

function Contract(pre, post) {
  this.pre = pre ? pre.slice() : [];
  this.post = post ? post.slice() : [];
}

Contract.prototype = {
  constructor: Contract,
  pre: [],
  post: [],
  verify: function verify(conditions, args) {
    conditions.forEach(
      function(condition) {
        var conditionResult = condition.apply(null, args);
        if (!conditionResult) {
          throw condition + " (" + Array.prototype.join.call(args, ", ") + ")";
        }
      }
    );
  },
  implementation: function(impl) {
    var contract = this;

    function contractFunction() {
      contract.verify(contract.pre, arguments);
      var result = impl.apply(this, arguments);
      Array.prototype.push.call(arguments, result);
      contract.verify(contract.post, arguments);
      return result;
    }

    contractFunction.contract = this;
    contractFunction.impl = impl;

    return contractFunction;
  }
};

module.exports = Contract;
