/*
 Copyright 2017 by Jan Dockx

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

  var dependencies = ["./../_private/util", "./ConditionError", "./AbstractContract",
                      "./PreconditionViolation", "./PostconditionViolation", "./ExceptionConditionViolation"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(util, ConditionError, AbstractContract,
           PreconditionViolation, PostconditionViolation, ExceptionConditionViolation) {
  "use strict";


  var propertyNames = ["contract", "implementation", "location", "bind", "displayName", "toString"];

  /**
   * The separation between AbstractContract and Contract is necessary to break a dependency
   * cycle with ConditionError.
   *
   * @constructor
   */
  function Contract(kwargs) {
    util.pre(function() {return !!kwargs;});
    util.pre(function() {return !kwargs.pre || util.typeOf(kwargs.pre) === "array";});
    util.pre(function() {return !kwargs.post || util.typeOf(kwargs.post) === "array";});
    util.pre(function() {return !kwargs.exception || util.typeOf(kwargs.exception) === "array";});

    AbstractContract.apply(this, arguments);
  }

  Contract.prototype = new AbstractContract(
    {pre: [AbstractContract.falseCondition]},
    AbstractContract.internalLocation
  );
  Contract.prototype.constructor = Contract;
  Contract.prototype.implementation = function(implFunction) {
    util.pre(this, function() {return !!Proxy;}); // jshint ignore:line
    util.pre(this, function() {return implFunction && util.typeOf(implFunction) === "function";});

    var contract = this;
    var location = util.firstLocationOutsideLibrary();
    var prototype;
    if (implFunction.hasOwnProperty("prototype")) {
      prototype = Object.create(implFunction.prototype);
    }

    var contractFunction = new Proxy(
      implFunction,
      {
        get: function(implFunction, propName) { // jshint ignore:line
          switch (propName) {
            case "contract":
              return contract;
            case "implementation":
              return implFunction;
            case "location":
              return location;
            case "bind":
              return AbstractContract.bindContractFunction;
            case "displayName":
              return AbstractContract.contractFunctionDisplayName(implFunction);
            case "prototype":
              return prototype || implFunction[propName];
            case "toString":
              return function() {
                return "[" + AbstractContract.contractFunctionDisplayName(implFunction) + "]";
              };
            default:
              return implFunction[propName];
          }
        },
        has: function(implFunction, propName) {
          if (0 <= propertyNames.indexOf(propName) || (propertyName === "prototype" && prototype)) {
            return true;
          }
          return propName in implFunction;
        },
        enumerate: function(implFunction) {
          return Object
            .keys(implFunction)
            .filter(key => propertyNames.indexOf(key) < 0 && (!prototype || key !== "prototype"))
            .concat(propertyNames)[Symbol.iterator]();
        },
        set: function(implFunction, propName, value) {
          // properties are not writable
          return false;
        },
        defineProperty: function(implFunction, propName, descriptor) {
          // properties are not configurable
          return false;
        },
        apply: function(implFunction, cfThis, args) {
          // cfThis: the this of the contract function call
          var extendedArgs = Array.prototype.slice.call(arguments);
          PreconditionViolation.prototype.verifyAll(contractFunction, contract.pre, cfThis, arguments);
          var result;
          var exception;
          try {
            result = implFunction.apply(cfThis, arguments);
          }
          catch (exc) {
            if (exc instanceof ConditionError) { // necessary to report only the deepest failure clearly
              throw exc;
            }
            exception = exc;
          }
          extendedArgs.push(exception || result);
          extendedArgs.push(contractFunction.bind(cfThis));
          if (exception) {
            ExceptionConditionViolation.prototype.verifyAll(contractFunction, contract.exception, cfThis, extendedArgs);
            throw exception;
          }
          PostconditionViolation.prototype.verifyAll(contractFunction, contract.post, cfThis, extendedArgs);
          return result;
        }
      }
    );

    if (prototype) {
      util.setAndFreezeProperty(prototype, "constructor", contractFunction);
    }

    return contractFunction;
  };

  Contract.root = AbstractContract.root;
  Contract.isAContractFunction = AbstractContract.isAContractFunction;

  return Contract;
}));
