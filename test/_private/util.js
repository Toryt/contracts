/*
 Copyright 2015 - 2017 by Jan Dockx

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
    {subject: undefined, expected: "undefined", isPrimitive: false},
    {subject: null, expected: "null", isPrimitive: false},
    {subject: {a: 4}, expected: "object", isPrimitive: false},
    {subject: [1, 2, 3], expected: "array", isPrimitive: false},
    {subject: function() {}, expected: "function", isPrimitive: false},
    {subject: new ReferenceError(), expected: "error", isPrimitive: false},
    {subject: new Date(), expected: "date", isPrimitive: false},
    {subject: /a-z/, expected: "regexp", isPrimitive: false},
    {subject: Math, expected: "math", isPrimitive: false},
    {subject: JSON, expected: "json", isPrimitive: false},
    {subject: new Number(4), expected: "number", isPrimitive: false},
    {subject: 4, expected: "number", isPrimitive: true},
    {subject: new String("abc"), expected: "string", isPrimitive: false},
    {subject: "abc", expected: "string", isPrimitive: true},
    {subject: new String(""), expected: "string", isPrimitive: false},
    {subject: "", expected: "string", isPrimitive: true},
    {subject: new Boolean(true), expected: "boolean", isPrimitive: false},
    {subject: false, expected: "boolean", isPrimitive: true},
    {subject: getGlobal(), expected: "object", isPrimitive: false},
    {subject: arguments, expected: "arguments", isPrimitive: false}
  ];

  // describe("_private", function() {
    describe("_private/util", function() {

      describe("#eol", function() {
        it("is a string", function() {
          expect(util.eol).to.be.a("string");
          testUtil.log("eol: start>" + util.eol + "<end" );
        });
      });

      describe("#contractLibPath", function() {
        it("is a string", function() {
          expect(util.contractLibPath).to.be.a("string");
          testUtil.log("contractLibPath: " + util.contractLibPath);
        });
      });

      describe("#typeof()", function() {
        stuff.forEach(function(record) {
          it("should return \"" + record.expected + "\" for " + record.subject, function() {
            var result = util.typeOf(record.subject);
            expect(result).to.be.a("string");
            expect(result).to.equal(record.expected);
          });
        });
      });

      describe("#isPrimitive()", function() {
        stuff.forEach(function(record) {
          it("correctly decides whether the argument is a primitive for " + record.subject, function() {
            var result = util.isPrimitive(record.subject);
            expect(result).to.be.a("boolean");
            expect(result).to.be.equal(record.isPrimitive);
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

      var truthySelf = {truth: true};

      var falsySelf = {truth: undefined};

      function selfCondition() {return this.truth;}

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
        it("correctly uses self when given, with a nominal end with a condition that returns true", function() {
          util.pre(truthySelf, selfCondition);
        });
        it("correctly uses self when given, throwing with a condition that returns false", function() {
          expect(function() {util.pre(falsySelf, selfCondition);})
            .to.throw(Error, new RegExp("^Precondition violation in Toryt Contracts: " + escape("" + selfCondition) + "$"));
        });
      });

      describe("#setAndFreezeProperty()", function() {
        it("sets a property, with a value, and freezes it", function() {
          var subject = {a: 4};
          var propertyName = "a new property";
          var propertyValue = "a new value";
          util.setAndFreezeProperty(subject, propertyName, propertyValue);
          testUtil.expectOwnFrozenProperty(subject, propertyName);
          expect(subject[propertyName]).to.equal(propertyValue);
        });
        it("sets a property, without a value, and freezes it", function() {
          var subject = {a: 4};
          var propertyName = "a new property";
          util.setAndFreezeProperty(subject, propertyName);
          testUtil.expectOwnFrozenProperty(subject, propertyName);
          //noinspection BadExpressionStatementJS
          expect(subject[propertyName]).to.be.undefined;
        });
      });

      describe("#defineFrozenDerivedProperty", function() {
        it("sets a frozen read-only property, with a getter", function() {
          var subject = {
            a: 4,
            expectedOfGetter: {}
          };
          Object.setPrototypeOf(subject, {});
          var propertyName = "a new property";
          var getter = function() {return this.expectedOfGetter;};
          util.defineFrozenDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter);
          expect(Object.getPrototypeOf(subject)).to.have.ownPropertyDescriptor(propertyName);
          expect(subject).not.to.have.ownPropertyDescriptor(propertyName);
          testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, propertyName);
          expect(subject[propertyName]).to.equal(subject.expectedOfGetter);
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
          var result = util.isFrozenOwnProperty(subject, propName);
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
          it("reports false if the property does not exist", function() {
            var result = util.isFrozenOwnProperty(subject, "some other, non-existing property name");
            //noinspection BadExpressionStatementJS
            expect(result).not.to.be.ok;
          });
          var specialized = {};
          Object.setPrototypeOf(specialized, subject);
          expect(specialized[propName]).to.equal(propValue); // check inheritance - test code validity
          var specializedResult = util.isFrozenOwnProperty(specialized, propName);
          it("reports false if the property is not an own property, and" +
             " enumerable === " + values[1] +
             " configurable === " + values[0] +
             " writable === " + values[2], function() {
            //noinspection BadExpressionStatementJS
            expect(specializedResult).not.to.be.ok;
          });
        });
        var notObjects = [0, false, "", "lala"];
        notObjects.forEach(function(notAnObject) {
          // cannot set a property on primitives
          it("reports false if the first parameter is a primitive (" + util.typeOf(notAnObject) + ")", function() {
            var result = util.isFrozenOwnProperty(notAnObject, propName);
            //noinspection BadExpressionStatementJS
            expect(result).not.to.be.ok;
          });
        });
        var fCandidates = [undefined, function() {}];
        testUtil.x(truths, truths, fCandidates, fCandidates).forEach(function(values) {
          var subject = {};
          Object.defineProperty(
            subject,
            propName,
            {
              configurable: values[0],
              enumerable: values[1],
              get: values[2],
              set: values[3]
            }
          );
          var result = util.isFrozenOwnProperty(subject, propName);
          var v3type = util.typeOf(values[3]);
          if (!values[0]
              && values[1]
              && util.typeOf(values[2]) === "function"
              && values[3] === undefined
              && subject.hasOwnProperty(propName)) {
            it("reports true if the property is an own property, " +
               "and it is enumerable, and not configurable, has a getter, but not a setter", function() {
              //noinspection BadExpressionStatementJS
              expect(result).to.be.true;
            });
          }
          else {
            it("reports false if the property is an own property," +
               " enumerable === " + values[1] +
               " configurable === " + values[0] +
               " get === " + values[2] +
               " set === " + values[3], function() {
              //noinspection BadExpressionStatementJS
              expect(result).not.to.be.ok;
            });
          }
        });
      });

      describe("#nrOfLines", function() {
        var regExp = new RegExp(util.eol, "gi");

        stuff
          .map(function(s) {return s.subject;})
          .concat([
            "This is a" + util.eol + "multi-line-string" + util.eol + "of 3 lines",
            new Error().stack,
            JSON.stringify(
              {
                a: "a",
                b: "b"
              }
            )
          ])
          .forEach(function(str) {
            var nrOfEols = (("" + str).match(regExp) || []).length + 1;
            it("the number of lines in the string representation of " + str + " should be " + nrOfEols, function() {
              expect(util.nrOfLines(str)).to.equal(nrOfEols);
            });
          });
      });

      describe("#isALocationOutsideLibrary", function() {
        stuff
          .map(function(s) {return s.subject;})
          .filter(function(s) {return util.typeOf(s) !== "string";})
          .forEach(function(value) {
            it("reports false on a location that is not a string: " + value, function() {
              var result = util.isALocationOutsideLibrary(value);
              //noinspection BadExpressionStatementJS
              expect(result).not.to.be.ok;
            });
          });
        ["single line", util.eol + "3 lines" + util.eol]
          .forEach(function(value) {
            it("reports false on a string that is not 2 lines long, but " + value.length, function() {
              var result = util.isALocationOutsideLibrary(value);
              //noinspection BadExpressionStatementJS
              expect(result).not.to.be.ok;
            });
          });
        it("reports false on a string that is 2 lines long, but where the first line is not empty", function() {
          var value = "there is stuff on the first line" + util.eol + "    at /";
          var result = util.isALocationOutsideLibrary(value);
          //noinspection BadExpressionStatementJS
          expect(result).not.to.be.ok;
        });
        ["at /", " at /", "   at /", "    /"]
          .forEach(function(secondLine) {
            it("reports false on a string that is 2 lines long, where the first line is empty, " +
               "but the second line does not start with 4 spaces and at, but is \"" + secondLine + "\"", function() {
              var value = util.eol + secondLine;
              var result = util.isALocationOutsideLibrary(value);
              //noinspection BadExpressionStatementJS
              expect(result).not.to.be.ok;
            });
        });
        it("reports false on a string that is 2 lines long, where the first line is empty, " +
           "and the second line does start with 4 spaces and at, but is does not contain a slash", function() {
          var value = util.eol + "    at and other text but not a slash";
          var result = util.isALocationOutsideLibrary(value);
          //noinspection BadExpressionStatementJS
          expect(result).not.to.be.ok;
        });
        it("reports true on a valid location outside the library", function() {
          var value = "    at /";
          var result = util.isALocationOutsideLibrary(value);
          //noinspection BadExpressionStatementJS
          expect(result).to.be.ok;
        });
      });

      describe("#firstLocationOutsideLibrary", function() {
        it ("reports a location for this test", function() {
          var result = util.firstLocationOutsideLibrary();
          expect(result).to.satisfy(function(r) {return util.isALocationOutsideLibrary(r);});
          testUtil.log("firstLocationOutsideLibrary:" + result);
        });

        // cannot test the result where no reference is found
      });

    });
  // });
})();
