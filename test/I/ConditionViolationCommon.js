/*
 Copyright 2016 - 2017 by Jan Dockx

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

module.exports = (function() {
  "use strict";

  var expect = require("chai").expect;
  var common = require("./ConditionErrorCommon");
  var ConditionViolation = require("../../src/I/ConditionViolation");
  var ConditionMetaError = require("../../src/I/ConditionMetaError");
  var Contract = require("../../src/I/Contract");

  var selfVerifyCases = [
    function() {return undefined;},
    function() {return null;},
    function() {return {};}
  ];

  function args() {return arguments;}

  var argsVerifyCases = [
    function() {return args();},
    function() {return args("an argument");},
    function() {return args("an argument", "another argument");},
    function() {return ["an argument in an array"];}
  ];

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionViolation);
    common.expectInvariants(subject);
    expect(subject).to.have.property("verify").that.is.a("function");
    expect(subject).to.have.property("verifyAll").that.is.a("function");
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    describe("#verify()", function() {
      function expectPost(subject, contractFunction, condition, self, args, appliedSelf, appliedArgs, exception) {
        var outcome;
        try {
          outcome = condition.apply();
        }
        catch (err) {
          it("should throw a ConditionMetaError because the condition had an error", function() {
            //noinspection BadExpressionStatementJS
            expect(exception).to.be.ok;
            expect(exception).to.be.instanceOf(ConditionMetaError);
            //noinspection JSUnresolvedVariable,BadExpressionStatementJS
            expect(exception).to.be.frozen;
            expect(exception.contractFunction).to.equal(contractFunction);
            expect(exception.error).to.deep.equal(err);
            expect(exception.condition).to.equal(condition);
            expect(exception.self).to.equal(self);
            expect(exception.args).to.eql(args);
          });
          return;
        }
        it("should have called the condition with the given this", function() {
          expect(appliedSelf).to.equal(self);
        });
        it("should have called the condition with the given arguments", function() {
          //noinspection BadExpressionStatementJS
          expect(appliedArgs).to.be.ok;
          //noinspection JSAnnotator,BadExpressionStatementJS
          expect(appliedArgs).to.be.arguments;
          expect(appliedArgs).to.have.lengthOf(args.length);
          for (var i = 0; i < args.length; i++) {
            expect(appliedArgs[i]).to.equal(args[i]);
          }
        });
        it("should throw an exception when the condition and evaluates to false, and not otherwise, " +
           "because the condition ended nominally",
          function() {
            expect(!exception).to.equal(!!outcome);
          }
        );
        if (!outcome) {
          it("should throw a ConditionViolation that is correctly configured, " +
             "because the condition evaluated to false nominally",
            function() {
              //noinspection BadExpressionStatementJS
              expect(exception).to.be.ok;
              expect(exception).to.be.instanceOf(ConditionViolation); //MUDO specific type too
              expectInvariants(exception);
              //noinspection JSUnresolvedVariable,BadExpressionStatementJS
              expect(exception).to.be.frozen;
              expect(exception.contractFunction).to.equal(contractFunction);
              expect(exception.condition).to.equal(condition);
              expect(exception.self).to.equal(self);
              expect(exception.args).to.eql(args);
            }
          );
        }
        else {
          it("should not throw an exception, because the condition evaluated to true nominally", function() {
            //noinspection BadExpressionStatementJS
            expect(exception).to.not.be.ok;
          });
        }
        it("adheres to the invariants", function() {
          expectInvariants(subject);
        });
      }

      var conditionCases = [
        function() {
          return function f() {
            f.self = this;
            f.args = arguments;
            // no return
          };
        },
        function() {
          return function f() {
            f.self = this;
            f.args = arguments;
            return false;
          };
        },
        function() {
          return function f() {
            f.self = this;
            f.args = arguments;
            return true;
          };
        },
        function() {
          return function f() {
            f.self = this;
            f.args = arguments;
            throw "This condition fails with an error";
          };
        }
      ];

      conditionCases.forEach(function(conditionGenerator) {
        selfVerifyCases.forEach(function(selfGenerator) {
          argsVerifyCases.forEach(function(argGenerator) {
            var subject = oneSubjectGenerator();
            var condition = conditionGenerator();
            var self = selfGenerator();
            var args = argGenerator();
            var contractFunction = common.createCandidateContractFunction();
            describe("works for " + condition + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verify(contractFunction, condition, self, args);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, contractFunction, condition, self, args, condition.self, condition.args, exception);
            });
          });
        });
      });
    });

    describe("#verifyAll()", function() {
      function expectPost(subject, contractFunction, conditions, self, args, exception) {
        if (conditions.length <= 0) {
          it("doesn't throw an exception if there are no conditions", function() {
            //noinspection BadExpressionStatementJS
            expect(exception).not.to.be.ok;
          });
          return;
        }
        var selfAndArgs = conditions.map(function(condition) {
          // save self and args, because in our determination of firstFailure, they will be overwritten
          return {self: condition.self, args: condition.args};
        });
        var firstFailure;
        var firstFailureIndex;
        var thrown;
        for (var i = 0; !firstFailure && i < conditions.length; i++) {
          try {
            var outcome = conditions[i].apply();
            if (!outcome) {
              firstFailure = conditions[i];
              firstFailureIndex = i;
            }
          }
          catch (err) {
            firstFailure = conditions[i];
            firstFailureIndex = i;
            thrown = err;
          }
        }
        it("throws an exception if one of the conditions fails or evaluates nominally to false", function() {
          expect(!!exception).to.equal(!!firstFailure);
        });
        if (thrown) {
          it("throws a ConditionMetaError if one of the conditions fails", function() {
            expect(exception).to.be.instanceOf(ConditionMetaError);
            //noinspection JSUnresolvedVariable,BadExpressionStatementJS
            expect(exception).to.be.frozen;
            expect(exception.condition).to.equal(firstFailure);
            expect(exception.contractFunction).to.equal(contractFunction);
            expect(exception.self).to.equal(self);
            expect(exception.args).to.eql(args);
          });
        }
        else if (firstFailure) {
          it("throws a ConditionViolation if one of the conditions evaluates nominally to false", function() {
            expect(exception).to.be.instanceOf(ConditionViolation);
            //noinspection JSUnresolvedVariable,BadExpressionStatementJS
            expect(exception).to.be.frozen;
            expect(exception.condition).to.equal(firstFailure);
            expect(exception.contractFunction).to.equal(contractFunction);
            expect(exception.self).to.equal(self);
            expect(exception.args).to.eql(args);
          });
        }
        else {
          it("ends nominally if all conditions evaluate nominally to true", function() {
            //noinspection BadExpressionStatementJS
            expect(exception).not.to.be.ok;
          });
        }
        it("evaluates all conditions up until the first failure with the given self and arguments", function() {
          for (var j = 0; j <= firstFailureIndex; j++) {
            expect(selfAndArgs[j].self).to.equal(self);
            var appliedArgs = selfAndArgs[j].args;
            //noinspection BadExpressionStatementJS
            expect(appliedArgs).to.be.ok;
            //noinspection JSAnnotator,BadExpressionStatementJS
            expect(appliedArgs).to.be.arguments;
            if (!args) {
              //noinspection BadExpressionStatementJS
              expect(appliedArgs).to.be.empty;
            }
            else {
              expect(appliedArgs).to.have.lengthOf(args.length);
              for (var i = 0; i < args.length; i++) {
                expect(appliedArgs[i]).to.equal(args[i]);
              }
            }
          }
        });
        it("does not evaluate conditions after the first failure", function() {
          for (var j = firstFailureIndex + 1; j < conditions.length; j++) {
            //noinspection BadExpressionStatementJS
            expect(selfAndArgs[j].self).not.to.be.ok;
            //noinspection BadExpressionStatementJS
            expect(selfAndArgs[j].args).not.to.be.ok;
          }
        });
        it("adheres to the invariants", function() {
          expectInvariants(subject);
        });
      }

      var conditionsCases = [
        function() {return [];},
        function() {
          return [
            function f() {
              f.self = this;
              f.args = arguments;
              return false;
            }
          ];
        },
        function() {
          return [
            function f() {
              f.self = this;
              f.args = arguments;
              return true;
            }
          ];
        },
        function() {
          return [
            function f() {
              f.self = this;
              f.args = arguments;
              return {};
            }
          ];
        },
        function() {
          return [
            function f1() {
              f1.self = this;
              f1.args = arguments;
              return true;
            },
            function f2() {
              f2.self = this;
              f2.args = arguments;
              return true;
            }
          ];
        },
        function() {
          return [
            function f1() {
              f1.self = this;
              f1.args = arguments;
              return true;
            },
            function f2() {
              f2.self = this;
              f2.args = arguments;
              return false;
            },
            function f3() {
              f3.self = this;
              f3.args = arguments;
              return true;
            }
          ];
        },
        function() {
          return [
            function f1() {
              f1.self = this;
              f1.args = arguments;
              return true;
            },
            function f3() {
              f3.self = this;
              f3.args = arguments;
              throw "This condition fails with an error";
            },
            function f3() {
              f3.self = this;
              f3.args = arguments;
              return true;
            }
          ];
        }
      ];

      conditionsCases.forEach(function(conditionsGenerator) {
        selfVerifyCases.forEach(function(selfGenerator) {
          argsVerifyCases.forEach(function(argGenerator) {
            var subject = oneSubjectGenerator();
            var conditions = conditionsGenerator();
            var self = selfGenerator();
            var args = argGenerator();
            var contractFunction = common.createCandidateContractFunction();
            describe("works for " + conditions + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verifyAll(contractFunction, conditions, self, args);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, contractFunction, conditions, self, args, exception);
            });
          });
        });
      });
    });

  }

  var test = {
    selfVerifyCases: selfVerifyCases,
    argsVerifyCases: argsVerifyCases,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
    expectInvariants: expectInvariants
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
