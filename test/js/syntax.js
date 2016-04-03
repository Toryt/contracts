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
    describe("js/syntax", function() {
      describe("#for-in", function() {
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
          var count = 0;
          var previous = -1;
          for (var key in o) { // jshint ignore:line
            count++;
            var current = orderOfKeysCommon.nFromRandomName(key);
            expect(current).to.equal(previous + 1);
            previous = current;
          }
          expect(count).to.equal(nrOfProperties);
        });
        it("should return all properties in the order they were defined, but those of the prototype last", function() {
          var o = orderOfKeysCommon.prepareAnObjectWithAProto();
          var count = 0;
          var previous = -1;
          for (var key in o) { // jshint ignore:line
            count++;
            var current = orderOfKeysCommon.nFromRandomName(key);
            expect(current).to.equal(previous + 1);
            //noinspection MagicNumberJS
            previous = current === 9 ? 99 : (current === 109 ? 199 : current);
          }
          //noinspection MagicNumberJS
          expect(count).to.equal(30);
        });
        it("should return all properties in the order they were defined in a literal", function() {
          var count = 0;
          var previous = -1;
          for (var key in orderOfKeysCommon.objectLiteral) { // jshint ignore:line
            count++;
            var current = orderOfKeysCommon.nFromRandomName(key);
            expect(current).to.equal(previous + 1);
            previous = current;
          }
          expect(count).to.equal(5);
        });
        it("should return all properties in the order they were defined in a JSON object", function() {
          var json = JSON.stringify(orderOfKeysCommon.objectLiteral);
          var count = 0;
          var previous = -1;
          for (var key in JSON.parse(json)) { // jshint ignore:line
            count++;
            var current = orderOfKeysCommon.nFromRandomName(key);
            expect(current).to.equal(previous + 1);
            previous = current;
          }
          expect(count).to.equal(3); // undefined and function not stringified
        });
      });

      function throwTest(toThrow) {
        var endedNominally;
        try {
          //noinspection ExceptionCaughtLocallyJS
          throw toThrow;
          //noinspection UnreachableCodeJS,JSHint
          endedNominally = true;
        }
        catch (thrown) {
          endedNominally = false;
          expect(thrown).to.equal(toThrow);
        }
        //noinspection BadExpressionStatementJS,JSHint
        expect(endedNominally).not.to.be.ok;
      }

      describe("#throw", function() {
        it("can throw a truthy thing", function() {
          throwTest("a string to throw");
        });
        it("can throw \"\"", function() {
          throwTest("");
        });
        it("can throw false", function() {
          throwTest(false);
        });
        it("can throw 0", function() {
          throwTest(0);
        });
        it("can throw undefined", function() {
          throwTest(undefined);
        });
        it("can throw null", function() {
          throwTest(null);
        });
      });
    });
  // });
})();
