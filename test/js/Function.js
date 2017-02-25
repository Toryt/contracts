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

  //noinspection JSUnresolvedFunction
  var expect = require("chai").expect;

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

    });
  // });
})();
