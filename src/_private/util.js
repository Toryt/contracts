
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

   var os = require("os");
   var path = require("path");

   var util = {

     eol: os.EOL,

     contractLibPath: path.dirname(path.dirname(module.filename)), // 2 directories up

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

     /**
      * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
      * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
      * boolean.
      */
     isPrimitive: function(p) {
       return (p !== null) && 0 <= ["number", "string", "boolean"].indexOf(typeof p);
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
       this.pre(function() {return !util.isPrimitive(obj);});
       this.pre(function() {return util.typeOf(propName) === "string";});

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
     },

     defineFrozenReadOnlyArrayProperty: function(prototype, propName, privatePropName) {
       this.pre(function() {return !util.isPrimitive(prototype);});
       this.pre(function() {return util.typeOf(propName) === "string";});
       this.pre(function() {return util.typeOf(privatePropName) === "string";});
       this.pre(function() {return propName !== privatePropName;});

       Object.defineProperty(
         prototype,
         propName,
         {
           configurable: false,
           enumerable: true,
           get: function() {
             return this[privatePropName].slice();
           },
           set: undefined
         }
       );
     },

     isFrozenOwnProperty: function(obj, propName) {
       this.pre(function() {return obj !== null && obj !== undefined;});

       var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
       return descriptor
              && descriptor.enumerable === true
              && descriptor.configurable === false
              && descriptor.writable === false;
     },

     nrOfLines: function(str) {
       return ("" + str).split(this.eol).length;
     },

     /**
      * The first line from a stack trace created here that refers to code that is not inside this library,
      * and does not refer to native code. Returns the empty string if no such line is found.
      * The result starts with an EOL.
      *
      * When this result is used as a line on its own, it is clickable to navigate to the referred source code
      * in most console.
      */
     firstLocationOutsideLibrary: function() {
       var stackSource = new Error();
       var stack = stackSource.stack.split(this.eol);
       stack = stack.slice(this.nrOfLines(stackSource)); // throw away the message lines
       for (var i = this.nrOfLines(stackSource); i < stack.length; i++) {
         // skip the message lines, and then look for the first line that refers to code not in this library,
         // that is not native code (i.e., the reference does contain a '/')
         if (0 <= stack[i].indexOf("/") && stack[i].indexOf(this.contractLibPath) < 0) {
           return this.eol + stack[i];
         }
       }
       return ""; // could not find a line outside this library
     }
   };

   return util;
 })();
