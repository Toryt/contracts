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

/*
  Does for ... iteration respect the order in which properties on an object are defined?
  And in what order are the properties of the prototype handled?

  According to the spec, the order is undefined. However,
  "All modern implementations of ECMAScript iterate through object properties in the order in which they were defined."
  (http://ejohn.org/blog/javascript-in-chrome/, "for loop order".)
 */

var expect = require("chai").expect;
var randomString = require("randomstring");

function randomName(/*Number*/ n) {
  var nString = "$$" + n + "$$";
  return randomString.generate() + nString;
}

function nFromRandomName(/*String*/ str) {
  return Number.parseInt(/\$\$(\d+)\$\$/.exec(str)[1]);
}

function prepareAnObject(/*Number*/ startValue, /*Number*/ nrOfProperties) {
  var max = startValue + nrOfProperties;
  var o = {};
  for (var i = startValue; i < max; i++) {
    o[randomName(i)] = i;
  }
  return o;
}

function prepareAnObjectWithAProto() {
  //noinspection MagicNumberJS
  var oProto1 = prepareAnObject(200, 10);
  var oProto2 = prepareAnObject(100, 10);
  Object.setPrototypeOf(oProto2, oProto1);
  var o = prepareAnObject(0, 10);
  Object.setPrototypeOf(o, oProto2);
  return o;
}


var objectLiteral = {
  "realFirst$$0$$": new Date(),
  "first$$1$$": null,
  "second$$2$$": 4,
  "third$$3$$": undefined, // will not be stringified
  "fourth$$4$$": function() {} // will not be stringified
};

describe("Object", function() {
  describe("#keys()", function() {
    it("should return all properties in the order they were defined", function() {
      //noinspection MagicNumberJS
      var nrOfProperties = 10000;
      var o = prepareAnObject(0, nrOfProperties);
      var keys = Object.keys(o);
      expect(keys.length).to.equal(nrOfProperties);
      var keyNumbers = keys.map(nFromRandomName);
      keyNumbers.reduce(function(previous, current) {
          expect(current).to.equal(previous + 1);
          return current;
        },
        -1
      );
    });
    it("does not return properties of the prototype", function() {
      var o = prepareAnObjectWithAProto();
      var keys = Object.keys(o);
      //noinspection MagicNumberJS
      expect(keys.length).not.to.equal(30);
      expect(keys.length).to.equal(10);
    });
    it("should return all properties in the order they were defined in a literal", function() {
      var keys = Object.keys(objectLiteral);
      expect(keys.length).to.equal(5);
      var keyNumbers = keys.map(nFromRandomName);
      keyNumbers.reduce(function(previous, current) {
          expect(current).to.equal(previous + 1);
          return current;
        },
        -1
      );
    });
    it("should return all properties in the order they were defined in a JSON object", function() {
      var json = JSON.stringify(objectLiteral);
      var keys = Object.keys(JSON.parse(json));
      expect(keys.length).to.equal(3); // undefined and function not stringified
      var keyNumbers = keys.map(nFromRandomName);
      keyNumbers.reduce(function(previous, current) {
          expect(current).to.equal(previous + 1);
          return current;
        },
        -1
      );
    });
  });
});

describe("syntax", function() {
  describe("#for-in", function() {
    it("should return all properties in the order they were defined", function() {
      //noinspection MagicNumberJS
      var nrOfProperties = 10000;
      var o = prepareAnObject(0, nrOfProperties);
      var count = 0;
      var previous = -1;
      for (var key in o) {
        count++;
        var current = nFromRandomName(key);
        expect(current).to.equal(previous + 1);
        previous = current;
      }
      expect(count).to.equal(nrOfProperties);
    });
    it("should return all properties in the order they were defined, but those of the prototype last", function() {
      var o = prepareAnObjectWithAProto();
      var count = 0;
      var previous = -1;
      for (var key in o) {
        count++;
        var current = nFromRandomName(key);
        expect(current).to.equal(previous + 1);
        previous = current === 9 ? 99 : (current === 109 ? 199 : current);
      }
      expect(count).to.equal(30);
    });
    it("should return all properties in the order they were defined in a literal", function() {
      var count = 0;
      var previous = -1;
      for (var key in objectLiteral) {
        count++;
        var current = nFromRandomName(key);
        expect(current).to.equal(previous + 1);
        previous = current;
      }
      expect(count).to.equal(5);
    });
    it("should return all properties in the order they were defined in a JSON object", function() {
      var json = JSON.stringify(objectLiteral);
      var count = 0;
      var previous = -1;
      for (var key in JSON.parse(json)) {
        count++;
        var current = nFromRandomName(key);
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
      //noinspection UnreachableCodeJS
      endedNominally = true;
    }
    catch (thrown) {
      endedNominally = false;
      expect(thrown).to.equal(toThrow);
    }
    //noinspection BadExpressionStatementJS
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
