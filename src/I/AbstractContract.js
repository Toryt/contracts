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

(function(factory) {
  "use strict";

  var dependencies = ["./../_private/util", "./ContractError"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(util, ContractError) {
  "use strict";

  var displayNamePrefix = "contract function ";

  /**
   * Abstract definition of a function contract.
   *
   * A AbstractContract consists of an array of preconditions, an array of nominal postconditions,
   * and an array of exceptional postconditions.
   *
   * The conditions are functions whose result is interpreted as a booleany value.
   * The conditions are called with the same `this` and arguments as the functional call in which they are
   * verified. When verifying nominal postconditions, the result of the function call is added as extra argument.
   * When verifying exceptional postconditions, the exception thrown by the function call is added as extra argument.
   * Finally, a version of the contract function bound to `this` is supplied as final parameter when verifying
   * nominal and exceptional postconditions. This function reference can be used in contracts that use recursion.
   *
   * Furthermore, an instance contains a `location` property, which is a line of text
   * that refers to the source code where the contract was created. For internal contracts, this is
   * `AbstractContract.internalLocation.
   *
   * @constructor
   */
  function AbstractContract(kwargs, /*Object?*/ internalLocation) {
    util.pre(function() {return !!kwargs;});
    util.pre(function() {return !kwargs.pre || util.typeOf(kwargs.pre) === "array";});
    util.pre(function() {return !kwargs.post || util.typeOf(kwargs.post) === "array";});
    util.pre(function() {return !kwargs.exception || util.typeOf(kwargs.exception) === "array";});
    util.pre(function() {return !internalLocation || internalLocation === AbstractContract.internalLocation;});

    var self = this;

    function abstract() {throw new AbstractContract.AbstractError(self);}

    var location = internalLocation || util.firstLocationOutsideLibrary();
    AbstractContract.bless(abstract, self, abstract, location);
    util.setAndFreezeProperty(self, "_pre", Object.freeze(kwargs.pre ? kwargs.pre.slice() : []));
    util.setAndFreezeProperty(self, "_post", Object.freeze(kwargs.post ? kwargs.post.slice() : []));
    util.setAndFreezeProperty(self, "_exception", Object.freeze(kwargs.exception ? kwargs.exception.slice() : []));
    util.setAndFreezeProperty(self, "location", Object.freeze(location));
    util.setAndFreezeProperty(self, "abstract", abstract);
  }

  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  AbstractContract.internalLocation = Object.freeze({
    toString: function() {return "INTERNAL";}
  });

  AbstractContract.prototype = {
    constructor: AbstractContract,
    _pre: null,
    _post: null,
    _exception: null,
    isImplementedBy: function(f) {
      return AbstractContract.isAGeneralContractFunction(f) && f.contract === this;
    }
  };
  util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, "pre", "_pre");
  util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, "post", "_post");
  util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, "exception", "_exception");
  util.setAndFreezeProperty(AbstractContract.prototype, "location", AbstractContract.internalLocation);
  util.setAndFreezeProperty(AbstractContract.prototype, "abstract", null);

  AbstractContract.displayNamePrefix = displayNamePrefix;

  /**
   * Return a string that is a sensible display name for the given function as a contract function.
   */
  AbstractContract.contractFunctionDisplayName = function(f) {
    util.pre(function() {return util.typeOf(f) === "function";});

    return displayNamePrefix
           + (f.name
              || (f.implementation && (f.implementation.displayName || f.implementation.name))
              || "<<anonymous>>");
  };

  /**
   * This function is intended to be used as the bind function of contract functions. It makes sure
   * that, when applied to a contract function, the result
   * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
   * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
   * The implementation of the resulting contract function is also bound in the same
   * way as the resulting contract function itself.
   */
  AbstractContract.bindContractFunction = function bind() {
    util.pre(this, function() {return AbstractContract.isAGeneralContractFunction(this);});

    var bound = Function.prototype.bind.apply(this, arguments);
    var boundImplementation = Function.prototype.bind.apply(this.implementation, arguments);
    AbstractContract.bless(bound, this.contract, boundImplementation, this.location);
    return bound;
  };

  /**
   * A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function
   * given as a parameter is a General Contract Function.
   *
   * To be a General Contract Function, the subject must
   * <ul>
   *   <li>be a function,</li>
   *   <li>have a frozen `contract` property that refers to a AbstractContract,</li>
   *   <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
   *   <li>have a frozen `location` property, that has a value,</li>
   *   <li>have a frozen `bind` property, which is {@link AbstractContract.bindContractFunction}, and</li>
   *   <li>have a `displayName` that is a contract function display name, which is a string that gives
   *     information for a programmer to understand which contract function this is.</li>
   * </ul>
   */
  AbstractContract.isAGeneralContractFunction = function(f) {
    // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
    // freeze it, and not guaranteed in all engines.
    return util.typeOf(f) === "function"
           && f.contract instanceof AbstractContract
           && util.isFrozenOwnProperty(f, "contract")
           && util.typeOf(f.implementation) === "function"
           && util.isFrozenOwnProperty(f, "implementation")
           && util.isFrozenOwnProperty(f, "location")
           && f.location
           && f.displayName === AbstractContract.contractFunctionDisplayName(f)
           && util.isFrozenOwnProperty(f, "bind")
           && f.bind === AbstractContract.bindContractFunction;
  };

  /**
   * A Contract Function is an implementation of a Contract. This function verifies whether a function
   * given as a parameter is a Contract Function.
   *
   * To be a Contract Function, the subject must
   * <ul>
   *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
   *   <li>have a frozen `location` property, which is a string that represents a location in source code,
   *     outside this library.</li>
   * </ul>
   */
  AbstractContract.isAContractFunction = function(f) {
    return AbstractContract.isAGeneralContractFunction(f) && util.isALocationOutsideLibrary(f.location);
  };

  /**
   * Helper function that transforms any function given as <code>contractFunction</code>
   * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
   * for the given <code>
   *
   * @param contractFunction {Function} the regular {Function} to be transformed into a contract function
   * @param contract {AbstractContract} the contract <code>contractFunction</code> is a realisation of
   * @param implFunction {Function} the function that is used in <code>contractFunction</code>
   *                     to realize the postconditions of <code>contract</code> under its preconditions
   * @param location {String} the location outside this library that the resulting
   *                          [contract function]{@linkplain AbstractContract#isAContractFunction} will carry,
   *                          that says where it is defined.
   */
  AbstractContract.bless = function bless(contractFunction, contract, implFunction, location) {
    util.pre(function() {return util.typeOf(contractFunction) === "function";});
    util.pre(function() {return !contractFunction.contract;});
    util.pre(function() {return !contractFunction.implementation;});
    util.pre(function() {return !contractFunction.location;});
    util.pre(function() {return contractFunction.bind === Function.prototype.bind;});
    util.pre(function() {return contract instanceof AbstractContract;});
    util.pre(function() {return util.typeOf(implFunction) === "function";});
    util.pre(function() {
      return location === AbstractContract.internalLocation || util.isALocationOutsideLibrary(location);
    });

    util.setAndFreezeProperty(contractFunction, "contract", contract);
    util.setAndFreezeProperty(contractFunction, "implementation", implFunction);
    util.setAndFreezeProperty(contractFunction, "location", location);
    util.setAndFreezeProperty(contractFunction, "bind", AbstractContract.bindContractFunction);
    util.defineFrozenDerivedProperty(
      contractFunction,
      "displayName",
      function() {return AbstractContract.contractFunctionDisplayName(this);}
    );
  };

  /**
   * Function that always returns <code>false</code>.
   */
  AbstractContract.falseCondition = function() {return false;};

  /**
   * The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can
   * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
   * which can be strengthened by specializations.
   */
  AbstractContract.root = new AbstractContract(
    {
      pre: [AbstractContract.falseCondition],
      post: [],
      exception: []
    },
    AbstractContract.internalLocation
  );

  var message = "an abstract function cannot be executed";

  /**
   * Thrown when an abstract method is called. You shouldn't.
   *
   * @constructor
   */
  function AbstractError(contract) {
    util.pre(function() {return contract instanceof AbstractContract;});

    ContractError.call(this);
    util.setAndFreezeProperty(this, "name", AbstractError.name);
    util.setAndFreezeProperty(this, "message", message);
    util.setAndFreezeProperty(this, "contract", contract);
  }

  AbstractError.prototype = new ContractError();
  AbstractError.prototype.constructor = AbstractError;
  util.setAndFreezeProperty(AbstractError.prototype, "name", AbstractError.name);
  util.setAndFreezeProperty(AbstractError.prototype, "message", message);
  util.setAndFreezeProperty(AbstractError.prototype, "contract", null);

  AbstractError.message = message;

  AbstractContract.AbstractError = AbstractError;

  return AbstractContract;
}));
