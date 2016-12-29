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
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  var getGlobal = new Function("return this;");

  //noinspection JSPrimitiveTypeWrapperUsage,JSHint
  var stuff = [
    {subject: undefined, expected: "undefined"},
    {subject: null, expected: "null"},
    {subject: {a: 4}, expected: "object"},
    {subject: [1, 2, 3], expected: "array"},
    {subject: function() {}, expected: "function"},
    {subject: new ReferenceError(), expected: "error"},
    {subject: new Date(), expected: "date"},
    {subject: /a-z/, expected: "regexp"},
    {subject: Math, expected: "math"},
    {subject: JSON, expected: "json"},
    {subject: new Number(4), expected: "number"},
    {subject: 4, expected: "number"},
    {subject: new String("abc"), expected: "string"},
    {subject: "abc", expected: "string"},
    {subject: new Boolean(true), expected: "boolean"},
    {subject: false, expected: "boolean"},
    {subject: getGlobal(), expected: "object"}
  ];

  // describe("_private", function() {
    describe("_private/util", function() {

      describe("#typeof()", function() {
        stuff.forEach(function(record) {
          it("should return the expected string for " + record.subject, function() {
            var result = util.typeOf(record.subject);
            expect(result).to.be.a("string");
            expect(result).to.equal(record.expected);
          });
        });
      });

      describe("#isInteger()", function() {
        stuff
          .map(function(record) {return record.subject;})
          .filter(function(thing) {return util.typeOf(thing) !== "number";})
          .forEach(function(thing) {
            it("should return false for " + thing, function() {
              var result = util.isInteger(thing);
              //noinspection BadExpressionStatementJS,JSHint
              expect(result).to.be.false;
            });
          });
        //noinspection JSUnresolvedVariable,MagicNumberJS
        [Number.MIN_SAFE_INTEGER, -4, -2.0, -1, 0, 1, 2.0, 6, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]
          .forEach(function(int) {
            it("should return true for " + int, function() {
              var result = util.isInteger(int);
              //noinspection BadExpressionStatementJS,JSHint
              expect(result).to.be.true;
            });
          });
        // It is surprising that this give true for Number.MAX_VALUE, and not for Number.MIN_VALUE!
        //noinspection MagicNumberJS
        [
          Number.NEGATIVE_INFINITY,
          Number.MIN_VALUE,
          -4.2,
          -1.000000000000001,
          0.00000000000000000009,
          Number.EPSILON,
          Math.E,
          Math.PI,
          Number.POSITIVE_INFINITY,
          Number.NaN
        ].forEach(function(nr) {
          it("should return false for " + nr, function() {
            var result = util.isInteger(nr);
            //noinspection BadExpressionStatementJS
            expect(result).to.be.false;
          });
        });
      });

      var truthy = function() {return true;};
      var falsy = function() {return undefined;};

      function escape(str) {
        var result = str.replace(/\(/g, "\\(");
        result = result.replace(/\)/g, "\\)");
        result = result.replace(/\{}/g, "\\{");
        return result;
      }

      describe("#pre()", function() {
        it("ends nominally with a condition that returns true without self", function() {
          util.pre(truthy);
        });
        [undefined, null, {a: 4}].forEach(function(self) {
          it("ends nominally with a condition that returns true with self === " + self, function() {
            util.pre(self, truthy);
          });
        });
        it("throws with a condition that returns false without self", function() {
          expect(function() {util.pre(falsy);})
            .to.throw(Error, new RegExp("^Precondition violation in Toryt Contracts: " + escape("" + falsy) + "$"));
        });
        [undefined, null, {a: 4}].forEach(function(self) {
          it("throws with a condition that returns false with self === " + self, function() {
            expect(function() {util.pre(self, falsy);})
              .to.throw(Error, new RegExp("^Precondition violation in Toryt Contracts: " + escape("" + falsy) + "$"));
          });
        });
      });

      describe("#setAndFreezeProperty()", function() {
        it("sets a property, and freezes it", function() {
          var subject = {a: 4};
          var propertyName = "a new property";
          var propertyValue = "a new value";
          util.setAndFreezeProperty(subject, propertyName, propertyValue);
          testUtil.expectOwnFrozenProperty(subject, propertyName);
          expect(subject[propertyName]).to.equal(propertyValue);
        });
      });

      describe("#defineFrozenReadOnlyArrayProperty", function() {
        it("sets a frozen read-only property, with a getter", function() {
          var subject = {a: 4};
          Object.setPrototypeOf(subject, {});
          var propertyName = "a new property";
          var privatePropertyName = "_" + propertyName;
          var array = [1, 2, 3];
          util.setAndFreezeProperty(subject, privatePropertyName, array);
          util.defineFrozenReadOnlyArrayProperty(Object.getPrototypeOf(subject), propertyName, privatePropertyName);
          testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, propertyName, privatePropertyName);
          expect(subject[propertyName]).to.eql(array);
          expect(subject[propertyName]).to.not.equal(array);
        });
      });

      describe("#isFrozenOwnProperty()", function() {
        var propName = "test prop name";
        var propValue = "dummy value";
        var truths = [true, false];
        testUtil.x(truths, truths, truths).forEach(function(values) {
          var subject = {};
          Object.defineProperty(
            subject,
            propName,
            {
              configurable: values[0],
              enumerable: values[1],
              writable: values[2],
              value: propValue
            }
          );
          var specialized = {};
          Object.setPrototypeOf(specialized, subject);
          expect(specialized[propName]).to.equal(propValue); // check inheritance - test code validity
          var result = util.isFrozenOwnProperty(subject, propName);
          var specializedResult = util.isFrozenOwnProperty(specialized, propName);
          if (!values[0] && values[1] && !values[2] && subject.hasOwnProperty(propName)) {
            it ("reports true if the property is an own property, " +
                "and it is enumerable, not configurable and not writable", function() {
              //noinspection BadExpressionStatementJS
              expect(result).to.be.true;
            });
          }
          else {
            it("reports false if the property is an own property, and" +
               " enumerable === " + values[1] +
               " configurable === " + values[0] +
               " writable === " + values[2], function() {
              //noinspection BadExpressionStatementJS
              expect(result).not.to.be.ok;
            });
          }
          it("reports false if the property is not an own property, and" +
             " enumerable === " + values[1] +
             " configurable === " + values[0] +
             " writable === " + values[2], function() {
            //noinspection BadExpressionStatementJS
            expect(specializedResult).not.to.be.ok;
          });
        });
      });

    });
  // });
})();
