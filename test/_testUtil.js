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

  var dependencies = ["chai", "../src/_private/util"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, util) {
  "use strict";

  var expect = chai.expect;

  function x() {
    if (arguments.length <= 0) {
      return [];
    }
    return Array.prototype.reduce.call(
      arguments,
      function(acc, arrayI) {
        var ret = [];
        acc.forEach(function(elementSoFar) {
          arrayI.forEach(function(elementOfI) {
            ret.push(elementSoFar.concat([elementOfI]));
          });
        });
        return ret;
      },
      [[]]
    );
  }

  function expectOwnFrozenProperty(subject, propertyName) {
    //noinspection JSUnresolvedFunction
    expect(subject).to.have.ownPropertyDescriptor(propertyName);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property("enumerable", true);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property("configurable", false);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property("writable", false);
    expect(function() {
      //noinspection MagicNumberJS
      subject[propertyName] = 42 + " some outlandish other value";
    }).to.throw(TypeError);
  }

  function prototypeThatHasOwnPropertyDescriptor(subject, propertyName) {
    if (!subject) {
      return subject;
    }
    if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
      return subject;
    }
    return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName);
  }

  function expectDerivedPropertyOnAPrototype(subject, propertyName, configurable) {
    var prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName);
    //noinspection JSUnresolvedFunction
    expect(prototype).to.have.ownPropertyDescriptor(propertyName);
    //noinspection JSUnresolvedFunction
    expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("enumerable", true);
    //noinspection JSUnresolvedFunction
    expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("configurable", configurable);
    //noinspection JSUnresolvedFunction
    expect(prototype).ownPropertyDescriptor(propertyName).not.to.have.property("writable");
    //noinspection JSUnresolvedFunction
    expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("get").that.is.a("function");
    //noinspection JSUnresolvedFunction,BadExpressionStatementJS
    expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("set").that.is.not.ok;
  }

  function expectConfigurableDerivedPropertyOnAPrototype(subject, propertyName) {
    expectDerivedPropertyOnAPrototype(subject, propertyName, true);
  }

  function expectFrozenDerivedPropertyOnAPrototype(subject, propertyName) {
    expectDerivedPropertyOnAPrototype(subject, propertyName, false);
  }

  function expectFrozenPropertyOnAPrototype(subject, propertyName) {
    var prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName);
    expectOwnFrozenProperty(prototype, propertyName);
  }

  function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, propName, privatePropName) {
    expect(subject).to.have.ownProperty(privatePropName); // array not shared
    expect(subject).to.have.property(privatePropName).that.is.an("array");
    this.expectOwnFrozenProperty(subject, privatePropName);
    expect(subject).to.have.property(propName).that.is.an("array");
    this.expectFrozenDerivedPropertyOnAPrototype(subject, propName);
    expect(function() {
      //noinspection MagicNumberJS
      subject[propName] = 42 + " some outlandish other value";
    }).to.throw(TypeError);
  }

  function expectToBeArrayOfFunctions(a) {
    expect(a).to.be.an("array");
    a.forEach(function(element) {
      expect(element).to.be.a("function");
    });
  }

  var doLog = false;

  function log() {
    if (doLog) {
      console.log.apply(undefined, arguments);
      console.log();
    }
  }

  function showStack(exc) {
    log("Exception stack%s---------------%s%s", util.eol, util.eol, exc.stack);
  }

  function regExpEscape(s) {
    //http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function propertyIsWritable(object, propertyName) {
    var prototype = prototypeThatHasOwnPropertyDescriptor(object, propertyName);
    var pd = prototype && Object.getOwnPropertyDescriptor(prototype, propertyName);
    return !pd || pd.writable;
  }

  return {
    x: x,
    expectOwnFrozenProperty: expectOwnFrozenProperty,
    expectConfigurableDerivedPropertyOnAPrototype: expectConfigurableDerivedPropertyOnAPrototype,
    expectFrozenDerivedPropertyOnAPrototype: expectFrozenDerivedPropertyOnAPrototype,
    expectFrozenReadOnlyArrayPropertyWithPrivateBackingField: expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
    expectFrozenPropertyOnAPrototype: expectFrozenPropertyOnAPrototype,
    expectToBeArrayOfFunctions: expectToBeArrayOfFunctions,
    log: log,
    showStack: showStack,
    regExpEscape: regExpEscape,
    propertyIsWritable: propertyIsWritable
  };

}));
