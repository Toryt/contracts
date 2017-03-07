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
  var path = require("path");

  var contractLibTestPath = path.dirname(path.dirname(module.filename));
  var getGlobal = new Function("return this;");

  function generateMutableStuff() {
    //noinspection JSPrimitiveTypeWrapperUsage,JSHint
    var result = [
      {subject: {a: 4}, expected: "object"},
      {subject: [1, 2, 3], expected: "array"},
      {subject: function() {}, expected: "function"},
      {subject: new ReferenceError(), expected: "error"},
      {subject: new Date(), expected: "date"},
      {subject: /a-z/, expected: "regexp"},
      {subject: new Number(4), expected: "number"},
      {subject: new String("abc"), expected: "string"},
      {subject: new String(""), expected: "string"},
      {subject: new Boolean(true), expected: "boolean"},
      {subject: arguments, expected: "arguments"}
    ];
    result.forEach(function(r) {r.isPrimitive = false;});
    return result;
  }

  //noinspection JSPrimitiveTypeWrapperUsage,JSHint
  var stuff = [
    {subject: undefined, expected: "undefined", isPrimitive: false},
    {subject: null, expected: "null", isPrimitive: false},
    {subject: Math, expected: "math", isPrimitive: false},
    {subject: JSON, expected: "json", isPrimitive: false},
    {subject: "abc", expected: "string", isPrimitive: true},
    {subject: "", expected: "string", isPrimitive: true},
    {subject: 4, expected: "number", isPrimitive: true},
    {subject: false, expected: "boolean", isPrimitive: true},
    {subject: getGlobal(), expected: "object", isPrimitive: false}
  ].concat(generateMutableStuff());

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

      describe("#defineConfigurableDerivedProperty", function() {
        it("sets a read-only property, with a getter", function() {
          var subject = {
            a: 4,
            expectedOfGetter: {}
          };
          Object.setPrototypeOf(subject, {});
          var propertyName = "a new property";
          var getter = function() {return this.expectedOfGetter;};
          util.defineConfigurableDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter);
          expect(Object.getPrototypeOf(subject)).to.have.ownPropertyDescriptor(propertyName);
          expect(subject).not.to.have.ownPropertyDescriptor(propertyName);
          testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, propertyName);
          expect(subject[propertyName]).to.equal(subject.expectedOfGetter);
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

      describe("#stackOutsideThisLibrary", function() {
        function defineErrorRecursively(togo) {
          /* It would be better here to be able to go in and out the library code, to see these calls are filtered.
             I see no sensible way to do this now, however. */
          if (!togo) {
            return new Error("This is a test case Error");
          }
          else {
            return defineErrorRecursively2(togo - 1);
          }
        }

        function defineErrorRecursively2(togo) {
          return defineErrorRecursively3(togo);
        }

        function defineErrorRecursively3(togo) {
          return defineErrorRecursively(togo);
        }

        //noinspection MagicNumberJS
        [
          {error: defineErrorRecursively(), description: "local error"},
          {error: defineErrorRecursively(18), description: "recursive generated error"}
        ].forEach(function(testCase) {
          it("only has stack lines outside the library, and the first line refers to this code, " +
             "for a " + testCase.description, function() {
            var result = util.stackOutsideThisLibrary(testCase.error);
            expect(result).to.be.a("string");
            testUtil.log("result:\n%s", result);
            var stackLines = result.split(util.eol);
            expect(stackLines).to.have.length.of.at.least(1);
            expect(stackLines[0]).to.satisfy(function(l) {return 0 <= l.indexOf(module.filename);});
            stackLines.forEach(function(line) {
              expect(line).to.be.a("string");
              expect(line).to.match(/^    at /);
              /* .../src/... contains the library code. This should never be mentioned in the stack trace.
               It is inner workings, and confuses the target audience, which is only interested in the code that
               uses the library. */
              expect(line).not.to.have.string(util.contractLibPath);
              /* In our tests, the code that uses the library is our test code in .../test/_private/util, or the
                 test framework library, in .../mocha/..., except for the last few lines. These lines will be
                 node-internal, and have no slash, or be internal/module.js. The first line should be our own code. */
              expect(line).to.satisfy(function(l) {
                return 0 <= l.indexOf(contractLibTestPath) ||
                       0 <= l.indexOf("/mocha/") ||
                       l.indexOf("/") < 0 ||
                       0 <= l.indexOf("require (internal/module.js");
              });
            });
            // all the lines, after the message, that are outside the library, are in the result,
            // and the order has not changed
            testCase.error.stack
              .split(util.eol)
              .splice(util.nrOfLines(testCase.error.message))
              .filter(function(line) {return line.indexOf(util.contractLibPath) < 0;})
              .forEach(function(line, sourceIndex) {
                expect(stackLines).to.satisfy(function(lines) {
                  return lines.some(function(stackLine, resultIndex) {
                    return stackLine === line && resultIndex <= sourceIndex;
                  });
                });
              });
          });
        });
      });

      describe("#conciseConditionRepresentation", function() {
        function isAConciseVersion(original, concise) {
          var split = ("" + concise).split(util.conciseSeparator);
          var cleanOriginal = original.replace(/\s\s+/g, " ");
          if (split.length < 2) {
            return original === concise;
          }
          else {
            // > 2 is not supported right now, and will fail
            return cleanOriginal.indexOf(split[0]) === 0
                   && cleanOriginal.indexOf(split[1]) === cleanOriginal.length - split[1].length;
          }
        }

        function expectGeneralPostconditions(result, expected) {
          testUtil.log("result: %s", result);
          expect(result).not.to.contain(util.eol);
          expect(result).to.have.length.of.at.most(util.maxLengthOfConciseRepresentation);
          expect(result)
            .to.satisfy(function(r) {return isAConciseVersion(expected, r);});
        }

        var prefix = "This is a test prefix";
        var alternativeName = "This is an alternative name";
        var namedStuff = generateMutableStuff();
        namedStuff
          .filter(function(ms) {return testUtil.propertyIsWritable(ms.subject, "name");})
          .forEach(function(ms) {ms.subject.name = alternativeName;});
        var displayNamedStuff = generateMutableStuff();
        displayNamedStuff
          .forEach(function(ms) {ms.subject.displayName = alternativeName;});

        function generateMultiLineAnonymousFunction() {
          return function() {
            var x = "This is a multi-line function";
            x += "The intention of this test";
            x += "is to verify";
            x += "whether we get an acceptable";
            x += "is to shortened version of this";
            x += "as a concise representation";
            x += "this function should have no name";
            x += "and no display name";
            return x;
          };
        }

        stuff = stuff
          .concat(namedStuff)
          .concat(displayNamedStuff)
          .map(function(s) {return s.subject;});
        stuff.push(generateMultiLineAnonymousFunction());
        var other = generateMultiLineAnonymousFunction();
        other.displayName = "This is a multi-line display name";
        other.displayName += "The intention of this test";
        other.displayName += "is to verify";
        other.displayName += "whether we get an acceptable";
        other.displayName += "is to shortened version of this";
        other.displayName += "as a concise representation";
        other.displayName += "this function should have a display name";
        stuff.push(other);

        stuff.forEach(function(f) {
          var result = util.conciseConditionRepresentation(prefix, f);
          if (!f || (!f.displayName && !f.name)) {
            it("returns the string representation with the prefix, " +
               "when there is no f, or it has no display name and no name, for " + f, function() {
              expectGeneralPostconditions(result, prefix + " " + f);
            });
          }
          else if (!f.displayName && !!f.name) {
            it("returns the name with the prefix, " +
               "when there is no f and it has no display name, but it has a name, for " + f, function() {
              expectGeneralPostconditions(result, prefix + " " + f.name);
            });
          }
          else {
            it("returns the display name if there is an f, and it has a display name, for " + f, function() {
              expectGeneralPostconditions(result, f.displayName);
            });
          }
        });
      });
    });
  // });

})();
