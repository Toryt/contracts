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
  var util = require("../../src/util");

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
    {subject: false, expected: "boolean"}
  ];

  describe("util", function() {

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

 // MUDO 3 tests to go

    // MUDO move
    // describe("#_setAndFreezeProperty()", function() {
    //   it("sets a property, and freezes it", function() {
    //     var subject = oneSubjectGenerator();
    //     var propertyName = "a new property";
    //     var propertyValue = "a new value";
    //     subject._setAndFreezeProperty(propertyName, propertyValue);
    //     testUtil.expectFrozenProperty(subject, propertyName);
    //     expect(subject[propertyName]).to.equal(propertyValue);
    //     expectInvariants(subject);
    //   });
    // });


  });
})();
