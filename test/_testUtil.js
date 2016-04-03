
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

   var expect = require("chai").expect;

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
   
   function expectFrozenProperty(subject, propertyName) {
     //noinspection JSUnresolvedFunction
     expect(subject).to.have.ownPropertyDescriptor(propertyName);
     //noinspection JSUnresolvedFunction
     expect(subject).ownPropertyDescriptor(propertyName).to.have.property("enumerable", true);
     //noinspection JSUnresolvedFunction
     expect(subject).ownPropertyDescriptor(propertyName).to.have.property("configurable", false);
     //noinspection JSUnresolvedFunction
     expect(subject).ownPropertyDescriptor(propertyName).to.have.property("writable", false);
   }

   return {
     x: x,
     expectFrozenProperty: expectFrozenProperty
   };

 })();
