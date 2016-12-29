/*
 Copyright 2015 - 2016 by Jan Dockx

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

(function() {
  "use strict";

  var expect = require("chai").expect;
  var orderOfKeysCommon = require("./_orderOfKeysCommon");

  // describe("js", function() {
    describe("js/Object", function() {
      describe("#keys()", function() {
        /*
         Does for ... iteration respect the order in which properties on an object are defined?
         And in what order are the properties of the prototype handled?

         According to the spec, the order is undefined. However,
         "All modern implementations of ECMAScript iterate through object properties in the order in which they were defined."
         (http://ejohn.org/blog/javascript-in-chrome/, "for loop order".)
         */

        it("should return all properties in the order they were defined", function() {
          //noinspection MagicNumberJS
          var nrOfProperties = 10000;
          var o = orderOfKeysCommon.prepareAnObject(0, nrOfProperties);
          var keys = Object.keys(o);
          expect(keys.length).to.equal(nrOfProperties);
          var keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName);
          keyNumbers.reduce(function(previous, current) {
              expect(current).to.equal(previous + 1);
              return current;
            },
            -1
          );
        });
        it("does not return properties of the prototype", function() {
          var o = orderOfKeysCommon.prepareAnObjectWithAProto();
          var keys = Object.keys(o);
          //noinspection MagicNumberJS
          expect(keys.length).not.to.equal(30);
          expect(keys.length).to.equal(10);
        });
        it("should return all properties in the order they were defined in a literal", function() {
          var keys = Object.keys(orderOfKeysCommon.objectLiteral);
          expect(keys.length).to.equal(5);
          var keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName);
          keyNumbers.reduce(function(previous, current) {
              expect(current).to.equal(previous + 1);
              return current;
            },
            -1
          );
        });
        it("should return all properties in the order they were defined in a JSON object", function() {
          var json = JSON.stringify(orderOfKeysCommon.objectLiteral);
          var keys = Object.keys(JSON.parse(json));
          expect(keys.length).to.equal(3); // undefined and function not stringified
          var keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName);
          keyNumbers.reduce(function(previous, current) {
              expect(current).to.equal(previous + 1);
              return current;
            },
            -1
          );
        });
      });

      describe("Object.defineProperty()", function() {
        var propName = "aProperty";

        function defineAProp(obj) {
          Object.defineProperty(
            obj,
            propName,
            {
              configurable: true,
              enumerable: true,
              writable: false,
              value: 42
            }
          );
        }

        [
          undefined,
          null,
          4,
          -1,
          "",
          "A string",
          new Date(),
          true,
          false,
          {},
          /foo/,
          function() {return "This simulates a self";},
          [],
          new ReferenceError(),
          Math,
          JSON,
          new Number(4),
          new String("abc"),
          new Boolean(false)
        ].forEach(function(obj) {
          it("sets a property on " + obj + " if it is non-primitive, and fails to do so if it is primitive", function() {
            var type = typeof obj;
            if (obj === null || type === "undefined" || type === "number" || type === "boolean" || type === "string") {
              expect(function() {defineAProp(obj);}).to.throw(TypeError);
            }
            else {
              defineAProp(obj);
              expect(obj).to.have.ownProperty(propName);
              delete obj[propName]; // cleanup
            }
          });
        });
      });
    });
  // });
})();
