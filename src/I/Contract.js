/*
 Copyright 2016 - 2017 by Jan Dockx

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
  var ContractError = require("./ContractError");

  var displayNamePrefix = "contract function ";

  /**
   * Abstract definition of a function Contract.
   *
   * A Contract consists of an optional array of preconditions, an optional array of nominal postconditions,
   * and an optional array of exceptional preconditions.
   *
   * The conditions are functions whose result is interpreted as a booleany value.
   * The conditions are called with the same `this` and arguments as the functional call in which they are
   * verified. When verifying nominal postconditions, the result of the function call is added as extra argument.
   * When verifying exceptional postconditions, the exception thrown by the function call is added as extra argument.
   * Finally, a version of the contract function bound to `this` is supplied as final parameter when verifying
   * nominal and exceptional postconditions. This function reference can be used in contracts that use recursion.
   *
   * Furthermore, an instance contains a `location` property, which is a line of text
   * that refers to the source code where the contract was created.
   */
  function Contract(pre, post, exception) {
    var self = this;

    function abstract() {throw new Contract.AbstractError(self);}

    var location = util.firstLocationOutsideLibrary();
    Contract.bless(abstract, self, abstract, location);
    util.setAndFreezeProperty(self, "_pre", Object.freeze(pre ? pre.slice() : []));
    util.setAndFreezeProperty(self, "_post", Object.freeze(post ? post.slice() : []));
    util.setAndFreezeProperty(self, "_exception", Object.freeze(exception ? exception.slice() : []));
    util.setAndFreezeProperty(self, "location", Object.freeze(location));
    util.setAndFreezeProperty(self, "abstract", abstract);
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
  util.setAndFreezeProperty(Contract.prototype, "location", util.firstLocationOutsideLibrary());

  Contract.displayNamePrefix = displayNamePrefix;

  /**
   * Return a string that is a sensible display name for the given function as a contract function.
   */
  Contract.contractFunctionDisplayName = function(f) {
    util.pre(function() {return util.typeOf(f) === "function";});

    return displayNamePrefix
           + (f.name
              || (f.implementation && (f.implementation.displayName || f.implementation.name))
              || "<<anonymous>>");
  };

  /**
   * This function is intended to be used as the bind function of contract functions. It makes sure
   * that, when applied to a contract function, the result
   * [is also a contract function]{@linkplain Contract#isAContractFunction}.
   * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
   * The implementation of the resulting contract function is also bound in the same
   * way as the resulting contract function itself.
   */
  Contract.bindContractFunction = function bind() {
    util.pre(this, function() {return Contract.isAContractFunction(this);});

    var bound = Function.prototype.bind.apply(this, arguments);
    var boundImplementation = Function.prototype.bind.apply(this.implementation, arguments);
    Contract.bless(bound, this.contract, boundImplementation, this.location);
    return bound;
  };

  /**
   * A Contract Function is an implementation of a Contract. This function verifies whether a function
   * given as a parameter is a Contract Function.
   *
   * To be a Contract Function, the subject must
   * <ul>
   *   <li>be a function,</li>
   *   <li>have a frozen `contract` property that refers to a Contract,</li>
   *   <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
   *   <li>have a frozen `location` property, which is a string that represents a location in source code,
   *     outside this library,</li>
   *   <li>have a frozen `bind` property, which is {@link Contract.bindContractFunction}, and</li>
   *   <li>have a `displayName` that is a contract function display name, which is a string that gives
   *     information for a programmer to understand which contract function this is.</li>
   * </ul>
   */
  Contract.isAContractFunction = function(f) {
    // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
    // freeze it, and not guaranteed in all engines.
    return util.typeOf(f) === "function"
           && f.contract instanceof Contract
           && util.isFrozenOwnProperty(f, "contract")
           && util.typeOf(f.implementation) === "function"
           && util.isFrozenOwnProperty(f, "implementation")
           && util.isALocationOutsideLibrary(f.location)
           && util.isFrozenOwnProperty(f, "location")
           && f.displayName === this.contractFunctionDisplayName(f)
           && util.isFrozenOwnProperty(f, "bind")
           && f.bind === Contract.bindContractFunction;
  };

  /**
   * Helper function that transforms any function given as <code>contractFunction</code>
   * into a [contract function]{@linkplain Contract#isAContractFunction}
   * for the given <code>
   *
   * @param contractFunction {Function} the regular {Function} to be transformed into a contract function
   * @param contract {Contract} the contract <code>contractFunction</code> is a realisation of
   * @param implFunction {Function} the function that is used in <code>contractFunction</code>
   *                     to realize the postconditions of <code>contract</code> under its preconditions
   * @param location {String} the location outside this library that the resulting
   *                          [contract function]{@linkplain Contract#isAContractFunction} will carry,
   *                          that says where it is defined.
   */
  Contract.bless = function bless(contractFunction, contract, implFunction, location) {
    util.pre(function() {return util.typeOf(contractFunction) === "function";});
    util.pre(function() {return !contractFunction.contract;});
    util.pre(function() {return !contractFunction.implementation;});
    util.pre(function() {return !contractFunction.location;});
    util.pre(function() {return contractFunction.bind === Function.prototype.bind;});
    util.pre(function() {return contract instanceof Contract;});
    util.pre(function() {return util.typeOf(implFunction) === "function";});
    util.pre(function() {return util.isALocationOutsideLibrary(location);});

    util.setAndFreezeProperty(contractFunction, "contract", contract);
    util.setAndFreezeProperty(contractFunction, "implementation", implFunction);
    util.setAndFreezeProperty(contractFunction, "location", location);
    util.setAndFreezeProperty(contractFunction, "bind", Contract.bindContractFunction);
    util.defineFrozenDerivedProperty(
      contractFunction,
      "displayName",
      function() {return Contract.contractFunctionDisplayName(this);}
    );
  };

  /**
   * Function that always returns <code>false</code>.
   */
  Contract.falseCondition = function() {return false;};

  /**
   * The most general function Contract. This has the most strict preconditions (nothing is allowed), which can
   * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
   * which can be strengthened by specializations.
   */
  Contract.root = new Contract(
    [Contract.falseCondition],
    [],
    []
  );

  /**
   * Thrown when an abstract method is called. You shouldn't.
   */
  function AbstractError(contract) {
    util.pre(function() {return contract instanceof Contract;});

    ContractError.call(this, AbstractError.message);
    util.setAndFreezeProperty(this, "contract", contract);
  }

  AbstractError.prototype = new ContractError("This is a dummy message in the AbstractError prototype.");
  AbstractError.prototype.constructor = AbstractError;
  AbstractError.prototype.name = "Abstract";
  AbstractError.prototype.contract = null;

  AbstractError.message = "An abstract function cannot be executed";

  Contract.AbstractError = AbstractError;

  return Contract;
})();
