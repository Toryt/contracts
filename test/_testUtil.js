
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

   var expect = require("chai").expect;
   var util = require("../src/_private/util");

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

   function prototypeThatHasOwnPropertyDescriptor(subject, propertyname) {
     if (!subject) {
       return subject;
     }
     if (Object.getOwnPropertyDescriptor(subject, propertyname)) {
       return subject;
     }
     return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyname);
   }

   function expectFrozenDerivedPropertyOnAPrototype(subject, propertyName) {
     var prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName);
     //noinspection JSUnresolvedFunction
     expect(prototype).to.have.ownPropertyDescriptor(propertyName);
     //noinspection JSUnresolvedFunction
     expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("enumerable", true);
     //noinspection JSUnresolvedFunction
     expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("configurable", false);
     //noinspection JSUnresolvedFunction
     expect(prototype).ownPropertyDescriptor(propertyName).not.to.have.property("writable");
     //noinspection JSUnresolvedFunction
     expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("get").that.is.a("function");
     //noinspection JSUnresolvedFunction,BadExpressionStatementJS
     expect(prototype).ownPropertyDescriptor(propertyName).to.have.property("set").that.is.not.ok;
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

   var doLog = true;

   function log() {
     if (doLog) {
       console.log.apply(undefined, arguments);
       console.log();
     }
   }

   return {
     x: x,
     expectOwnFrozenProperty: expectOwnFrozenProperty,
     expectFrozenDerivedPropertyOnAPrototype: expectFrozenDerivedPropertyOnAPrototype,
     expectFrozenReadOnlyArrayPropertyWithPrivateBackingField: expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
     expectToBeArrayOfFunctions: expectToBeArrayOfFunctions,
     log: log
   };

 })();
