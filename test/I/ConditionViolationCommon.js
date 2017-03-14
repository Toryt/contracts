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

(function(factory) {
  "use strict";

  var dependencies = ["chai", "../_testUtil", "./ConditionErrorCommon",
                      "../../src/I/ConditionMetaError", "../../src/I/ConditionViolation", "./ConditionMetaErrorCommon"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil, common, ConditionMetaError, ConditionViolation, conditionMetaErrorCommon) {
  "use strict";

  var expect = chai.expect;

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
    testUtil.expectFrozenPropertyOnAPrototype(subject, "verify");
    expect(subject).to.have.property("verify").that.is.a("function");
    testUtil.expectFrozenPropertyOnAPrototype(subject, "verifyAll");
    expect(subject).to.have.property("verifyAll").that.is.a("function");
  }

  function expectProperties(exception, Type, contractFunction, condition, self, args) {
    common.expectProperties.apply(undefined, arguments);
    //noinspection BadExpressionStatementJS
    expect(exception).to.be.frozen;
  }

  function doctorArgs(args, boundContractFunction) {
    return args;
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    var that = this;

    describe("#verify()", function() {
      function expectPost(subject, contractFunction, condition, self, args, doctoredArgs, appliedSelf, appliedArgs, exception) {
        var outcome;
        try {
          outcome = condition.apply();
        }
        catch (ignore) {
          it("should throw a ConditionMetaError because the condition had an error", function() {
            conditionMetaErrorCommon.expectProperties(exception, ConditionMetaError, contractFunction, condition, self, doctoredArgs);
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
          // doctoredArgs might be arguments, or Array
          expect(Array.prototype.slice.call(doctoredArgs)).to.eql(Array.prototype.slice.call(appliedArgs));
        });
        it("should throw an exception when the condition and evaluates to false, and not otherwise, " +
           "because the condition ended nominally",
          function() {
            expect(!exception).to.equal(!!outcome);
          }
        );
        if (!outcome) {
          it("should throw a ...ConditionViolation that is correctly configured, " +
             "because the condition evaluated to false nominally",
            function() {
              var extraProperty = doctoredArgs[args.length]; // might not exist
              that.expectProperties(exception, subject.constructor, contractFunction, condition, self, args, extraProperty);
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
          that.expectInvariants(subject);
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
            var doctoredArgs = that.doctorArgs(args, contractFunction.bind(self));
            describe("works for " + condition + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verify(contractFunction, condition, self, doctoredArgs);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, contractFunction, condition, self, args, doctoredArgs, condition.self, condition.args, exception);
            });
          });
        });
      });
    });

    describe("#verifyAll()", function() {
      function expectPost(subject, contractFunction, conditions, self, args, doctoredArgs, exception) {
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
            conditionMetaErrorCommon.expectProperties(exception, ConditionMetaError, contractFunction, firstFailure, self, doctoredArgs);
          });
        }
        else if (firstFailure) {
          it("throws a …ConditionViolation if one of the conditions evaluates nominally to false", function() {
            var extraProperty = doctoredArgs[args.length]; // might not exist
            that.expectProperties(exception, subject.constructor, contractFunction, firstFailure, self, args, extraProperty);
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
              // doctoredArgs might be arguments, or Array
              expect(Array.prototype.slice.call(doctoredArgs)).to.eql(Array.prototype.slice.call(appliedArgs));
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
          that.expectInvariants(subject);
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
            var doctoredArgs = that.doctorArgs(args, contractFunction.bind(self));
            describe("works for " + conditions + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verifyAll(contractFunction, conditions, self, doctoredArgs);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, contractFunction, conditions, self, args, doctoredArgs, exception);
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
    expectInvariants: expectInvariants,
    expectProperties: expectProperties,
    doctorArgs: doctorArgs
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
