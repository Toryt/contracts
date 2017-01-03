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

  var util = require("./../_private/util");

  var displayNamePrefix = "contract function";

  function contractFunctionDisplayName(f) {
    util.pre(function() {return util.typeOf(f) === "function";});

    var displayName = f.displayName || f.name;
    return "contract function" + (displayName ? " " + displayName : "");
  }

  /**
   * Abstract definition of a function Contract.
   */
  function Contract(pre, post, exception) {
    util.setAndFreezeProperty(this, "_pre", pre ? pre.slice() : []);
    util.setAndFreezeProperty(this, "_post", post ? post.slice() : []);
    util.setAndFreezeProperty(this, "_exception", exception ? exception.slice() : []);
  }

  Contract.prototype = {
    constructor: Contract,
    _pre: null,
    _post: null,
    _exception: null,
    isImplementedBy: function(f) {
      return Contract.isAContractFunction(f) && f.contract === this;
    }
  };
  util.defineFrozenReadOnlyArrayProperty(Contract.prototype, "pre", "_pre");
  util.defineFrozenReadOnlyArrayProperty(Contract.prototype, "post", "_post");
  util.defineFrozenReadOnlyArrayProperty(Contract.prototype, "exception", "_exception");

  Contract.displayNamePrefix = displayNamePrefix;
  Contract.contractFunctionDisplayName = contractFunctionDisplayName;
  Contract.isAContractFunction = function(f) {
    return util.typeOf(f) === "function"
           && f.contract instanceof Contract
           && util.isFrozenOwnProperty(f, "contract")
           && Object.isFrozen(f.contract)
           && util.typeOf(f.implementation) === "function"
           && util.isFrozenOwnProperty(f, "implementation")
           && util.isFrozenOwnProperty(f, "name")
           && f.name === f.implementation.name
           && util.isFrozenOwnProperty(f, "displayName")
           && f.displayName === contractFunctionDisplayName(f.implementation);
  };
  Contract.dummyImplementation = function() {
    function dummyImplementation() {return "This is a dummy contract implementation.";}

    var dummyContract = new Contract();
    Object.freeze(dummyContract);
    var contractFunction = function() {};
    util.setAndFreezeProperty(contractFunction, "contract", dummyContract);
    util.setAndFreezeProperty(contractFunction, "implementation", dummyImplementation);
    util.setAndFreezeProperty(contractFunction, "name", dummyImplementation.name);
    util.setAndFreezeProperty(contractFunction, "displayName", contractFunctionDisplayName(dummyImplementation));
    return contractFunction;
  };

  return Contract;
})();
