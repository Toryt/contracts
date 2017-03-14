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

  var dependencies = ["chai", "../_testUtil"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil) {
  "use strict";

  var expect = chai.expect;

  var message = "A message";
  var env = testUtil.environment;
  var isFF = (env === "firefox");

  // describe("js", function() {
    describe("js/Error", function() {
      describe("#message", function() {
        it("has the expected message", function() {
          var subject = new Error(message);
          testUtil.log("message: %s", subject.message);
          expect(subject.message).to.equal(message);
        });
      });
      describe("#name", function() {
        it("has the expected name", function() {
          var subject = new Error(message);
          testUtil.log("name: %s", subject.name);
          expect(subject.name).to.equal("Error");
        });
      });
      describe("#toString()", function() {
        it("return the name and the message, separated by a colon", function() {
          var subject = new Error(message);
          var result = subject.toString();
          testUtil.log("toString(): %s", result);
          expect(result).to.be.a("string");
          expect(result).to.equal("Error: " + message);
        });
      });
      describe("#fileName", function() {
        it("has " + (isFF ? "a" : "no") +" file name in " + env, function() {
          var subject = new Error(message);
          testUtil.log("fileName: %s", subject.fileName);
          //noinspection BadExpressionStatementJS
          expect(subject.fileName)[isFF ? "to" : "not"].to.be.ok; // not supported in node
        });
      });
      describe("#lineNumber", function() {
        it("has " + (isFF ? "a" : "no") + " line number in " + env, function() {
          var subject = new Error(message);
          testUtil.log("lineNumber: %s", subject.lineNumber);
          //noinspection BadExpressionStatementJS
          expect(subject.lineNumber)[isFF ? "to" : "not"].to.be.ok; // not supported in node
        });
      });
      describe("#columnNumber", function() {
        it("has " + (isFF ? "a" : "no") + " column number in " + env, function() {
          var subject = new Error(message);
          testUtil.log("columnNumber: %s", subject.columnNumber);
          //noinspection BadExpressionStatementJS
          expect(subject.columnNumber)[isFF ? "to" : "not"].to.be.ok; // not supported in node
        });
      });
      describe("#stack", function() {
        it("has a stack, is a string, that starts with the toString()", function() {
          var subject = new Error(message);
          var stack = subject.stack;
          testUtil.log("stack: %s", subject.stack);
          //noinspection BadExpressionStatementJS
          expect(stack).to.be.ok; // not supported in old IE
          expect(stack).to.be.a("string");
          expect(stack.indexOf(subject.toString())).to.equal(0);
        });
        it("has a stack, that reports where the error is created", function() {
          function createAnError() {
            return new Error(message);
          }

          function throwAnError() {
            var anError = createAnError();
            throw anError;
          }

          try {
            throwAnError();
          }
          catch(err) {
            testUtil.log("err.stack: %s", err.stack);
            //noinspection BadExpressionStatementJS
            expect(err.stack).to.be.ok; // not supported in old IE
            expect(err.stack.indexOf("createAnError")).to.be.at.least(0);
            // and be on the first line
            var lines = err.stack.split("\n");
            lines.forEach(function(l, i) {
              var found = l.indexOf("createAnError");
              if (i === 1) {
                expect(found).to.be.at.least(0);
              }
              else {
                expect(found).to.be.below(0);
              }
            });
          }
        });
        it("has a stack, that reports where Error.captureStackTrace is called last", function() {
          // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
          function createAnError() {
            return new Error(message);
          }

          function captureTheStackTrace1(err) {
            Error.captureStackTrace(err);
          }

          function throwAnError() {
            var anError = createAnError();
            captureTheStackTrace1(anError); // this will be overwritten
            throw anError;
          }

          function captureTheStackTrace2(err) {
            captureTheStackTrace1(err);
          }

          function captureTheStackTrace3(err) {
            captureTheStackTrace2(err);
          }


          try {
            try {
              throwAnError();
            }
            catch(err1) {
              captureTheStackTrace3(err1);
              //noinspection ExceptionCaughtLocallyJS
              throw err1;
            }
          }
          catch (err2) {
            testUtil.log("err.stack: %s", err2.stack);
            //noinspection BadExpressionStatementJS
            expect(err2.stack).to.be.ok; // not supported in old IE
            expect(err2.stack.indexOf("createAnError")).to.be.below(0);
            expect(err2.stack.indexOf("throwAnError")).to.be.below(0);
            expect(err2.stack.indexOf("captureTheStackTrace1")).to.be.at.least(0);
            expect(err2.stack.indexOf("captureTheStackTrace2")).to.be.at.least(0);
            expect(err2.stack.indexOf("captureTheStackTrace3")).to.be.at.least(0);
            // and be on the first line
            var lines = err2.stack.split("\n");
            lines.forEach(function(l, i) {
              var found = l.indexOf("captureTheStackTrace");
              if (1 <= i && i <= 3) {
                expect(found).to.be.at.least(0);
              }
              else {
                expect(found).to.be.below(0);
              }
            });
          }
        });
      });
    });
  // });
}));
