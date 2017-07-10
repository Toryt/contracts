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
        [
          function simpleF() {return "This is a very simple function.";},
          class SimpleClass {}
        ].forEach(function(f) {
          it("exists on function " + f, function() {
            function otherSimpleF() {return "This is another very simple function.";}

            expect(f).to.haveOwnProperty("prototype");
            expect(f).to.have.property("prototype").that.is.an("object");
            expect(f).to.have.property("prototype").instanceOf(Object);
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f.prototype).to.satisfy(
              function(simpleFProto) {return Object.getPrototypeOf(simpleFProto) === Object.prototype;}
            );
            //noinspection JSPotentiallyInvalidConstructorUsage
            expect(f).to.have.property("prototype").that.not.equals(otherSimpleF.prototype);
            //noinspection JSPotentiallyInvalidConstructorUsage
            console.log(JSON.stringify(f.prototype));
          });
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
