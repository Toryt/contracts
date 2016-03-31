
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

   var util = {
     /**
      * A better type then Object.toString() or typeof.
      * - toType(undefined); //"undefined"
      * - toType(new); //"null"
      * - toType({a: 4}); //"object"
      * - toType([1, 2, 3]); //"array"
      * - (function() {console.log(toType(arguments))})(); //arguments
      * - toType(new ReferenceError); //"error"
      * - toType(new Date); //"date"
      * - toType(/a-z/); //"regexp"
      * - toType(Math); //"math"
      * - toType(JSON); //"json"
      * - toType(new Number(4)); //"number"
      * - toType(new String("abc")); //"string"
      * - toType(new Boolean(true)); //"boolean"
      *
      * Based on
      * http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
      */
     typeOf: function(obj) {
       if (obj === null) { // workaround for some weird implementations
         return "null";
       }
       var result = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
       // on some browsers, the main window returns as "global" (WebKit) or "window" (FF), but this is an object too
       if (result === "global" || result === "window") {
         result = "object";
       }
       return result; // return String
     },

     isInteger: function(value) {
       return Number.isInteger
         ? Number.isInteger(value)
         : typeof value === "number"
           && isFinite(value)
           && Math.floor(value) === value;
     },

     pre: function(/*Object?*/ self, /*Function*/ condition) {
       var shiftedCondition = condition || self;
       var shiftedSelf = condition ? self : undefined;
       if (!shiftedCondition.apply(self)) {
         throw new Error("Precondition violation in Toryt Contracts: " + shiftedCondition);
       }
     },

     setAndFreezeProperty: function(obj, propName, value) {
       Object.defineProperty(
         obj,
         propName,
         {
           configurable: false,
           enumerable: true,
           writable: false,
           value: value
         }
       );
     }
   };

   return util;
 })();
