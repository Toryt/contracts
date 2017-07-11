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

(function(factory) {
  "use strict";

  var dependencies = ["../_util/describe", "../_util/it", "../_util/expect"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(describe, it, expect) {
  "use strict";

  // describe("js", function() {
    describe("js/Function", function() {
      describe("#bind()", function() {
        it("keeps a call of a bound function with another this bound to the bound this", function() {
          function testF() {return this.property;} // jshint ignore:line

          var boundThisPropertyValue = "bound this property value";
          var boundThis = {
            property: boundThisPropertyValue
          };
          //noinspection JSUnresolvedFunction
          var boundF = testF.bind(boundThis);
          //noinspection JSUnresolvedVariable
          expect(boundF()).to.equal(boundThisPropertyValue);
          var otherThisPropertyValue = "other this property value";
          var otherThis = {
            property: otherThisPropertyValue
          };
          //noinspection JSUnresolvedFunction
          var otherThisResult = boundF.call(otherThis);
          //noinspection JSUnresolvedVariable
          expect(otherThisResult).to.equal(boundThisPropertyValue);
        });
      });
      describe("#prototype", function() {
        it("does not exist on the Function.prototype", function() {
          expect(Function.prototype).not.to.have.property("prototype");
        });
        [
          function simpleF() {return "This is a very simple function.";},
          class SimpleClass {}
        ].forEach(function(f) {
          it("exists on function " + f, function() {
            function otherSimpleF() {return "This is another very simple function.";}

            expect(Object.getPrototypeOf(f)).to.equal(Function.prototype);
            expect(f).to.haveOwnProperty("prototype");
            expect(f).to.have.property("prototype").that.is.an("object");
            expect(f).to.have.property("prototype").instanceOf(Object);
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f.prototype).to.satisfy(
              function(simpleFProto) {return Object.getPrototypeOf(simpleFProto) === Object.prototype;}
            );
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f).to.have.property("prototype").that.not.equals(Function.prototype);
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f).to.have.property("prototype").that.not.equals(Function.prototype.prototype);
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f).to.have.property("prototype").that.not.equals(otherSimpleF.prototype);
            expect(f.prototype).to.haveOwnProperty("constructor");
            expect(f.prototype).to.have.property("constructor").that.equals(f);
            //noinspection JSPotentiallyInvalidConstructorUsage
            console.log(JSON.stringify(f.prototype));
          });
          it("cannot be deleted (not enumerable and not configurable) from function " + f, function() {
            console.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, "prototype")));
            try {
              delete f.prototype;
            }
            catch (err) {
              expect(err).to.be.instanceOf(TypeError);
            }
            expect(f).to.have.ownPropertyDescriptor("prototype").that.has.property("enumerable", false);
            expect(f).to.have.ownPropertyDescriptor("prototype").that.has.property("configurable", false);
            console.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, "prototype")));
          });
        });
        it("is writable for a simple function", function() {
          function simpleF() {return "This is a very simple function.";}

          expect(simpleF).to.have.ownPropertyDescriptor("prototype").that.has.property("writable", true);
          console.log(JSON.stringify(Object.getOwnPropertyDescriptor(simpleF, "prototype")));
          var newObject = {name: "a new object"};
          //noinspection JSPotentiallyInvalidConstructorUsage
          simpleF.prototype = newObject;
          expect(simpleF).to.have.property("prototype").that.equals(newObject);
        });
        it("is not writable for a class", function() {
          class SimpleClass {}

          expect(SimpleClass).to.have.ownPropertyDescriptor("prototype").that.has.property("writable", false);
          console.log(JSON.stringify(Object.getOwnPropertyDescriptor(SimpleClass, "prototype")));
          var newObject = {name: "a new object"};
          try {
            //noinspection JSPotentiallyInvalidConstructorUsage
            SimpleClass.prototype = newObject;
          }
          catch (err) {
            expect(err).to.be.instanceOf(TypeError);
          }
        });
      });
      describe("new", function() {
        [
          function simpleF() {return "This is a very simple function.";},
          class SimpleClass {}
        ].forEach(function(f) {
          it("can be used as a constructor " + f, function() {
            var result = new f();
            expect(result).to.be.an("object");
            expect(result).to.be.instanceOf(f);
            expect(Object.getPrototypeOf(result)).to.equal(f.prototype);
            //noinspection JSPotentiallyInvalidConstructorUsage
            console.log(JSON.stringify(result));
          });
        });
      });
    });
  // });

}));
