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

/* eslint-env mocha */

'use strict'

const testUtil = require('../_util/testUtil')
const common = require('./ConditionErrorCommon')
const ConditionMetaError = require('../../src/IV/ConditionMetaError')
const ConditionViolation = require('../../src/IV/ConditionViolation')
const conditionMetaErrorCommon = require('./ConditionMetaErrorCommon')

function isArguments (o) {
  const str = '' + o
  str.must.equal('[object Arguments]')
}

const selfVerifyCases = [
  function () { return undefined },
  function () { return null },
  function () { return {} }
]

function args () { return arguments }

const argsVerifyCases = [
  function () { return args() },
  function () { return args('an argument') },
  function () { return args('an argument', 'another argument') },
  function () { return ['an argument in an array'] }
]

function expectInvariants (subject) {
  subject.must.be.an.instanceof(ConditionViolation)
  common.expectInvariants(subject)
  testUtil.expectFrozenPropertyOnAPrototype(subject, 'verify')
  subject.verify.must.be.a.function()
  testUtil.expectFrozenPropertyOnAPrototype(subject, 'verifyAll')
  // noinspection JSUnresolvedVariable
  subject.verifyAll.must.be.a.function()
}

// noinspection ParameterNamingConventionJS
function expectProperties (exception, Type, contractFunction, condition, self, args) {
  common.expectProperties.apply(undefined, arguments)
  exception.must.be.frozen()
}

// noinspection JSUnusedLocalSymbols
function doctorArgs (args, boundContractFunction) {
  return args
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  const that = this // jshint ignore:line

  describe('#verify()', function () {
    function expectPost (subject, contractFunction, condition, self, args, doctoredArgs, appliedSelf, appliedArgs, exception) {
      let outcome
      try {
        outcome = condition.apply()
      } catch (ignore) {
        it('should throw a ConditionMetaError because the condition had an error', function () {
          // noinspection JSUnresolvedFunction
          conditionMetaErrorCommon.expectProperties(exception, ConditionMetaError, contractFunction, condition, self, doctoredArgs)
        })
        return
      }
      it('should have called the condition with the given this', function () {
        appliedSelf.must.equal(self)
      })
      it('should have called the condition with the given arguments', function () {
        appliedArgs.must.be.truthy()
        isArguments(appliedArgs)
        // doctoredArgs might be arguments, or Array
        Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(appliedArgs))
      })
      it(
        'should throw an exception when the condition and evaluates to false, and not otherwise, ' +
        'because the condition ended nominally',
        function () {
          const notException = !exception
          notException.must.equal(!!outcome)
        }
      )
      if (!outcome) {
        it(
          'should throw a ...ConditionViolation that is correctly configured, ' +
          'because the condition evaluated to false nominally',
          function () {
            const extraProperty = doctoredArgs[args.length] // might not exist
            that.expectProperties(exception, subject.constructor, contractFunction, condition, self, args, extraProperty)
          }
        )
      } else {
        it('should not throw an exception, because the condition evaluated to true nominally', function () {
          exception.must.be.falsy()
        })
      }
      it('adheres to the invariants', function () {
        that.expectInvariants(subject)
      })
    }

    const conditionCases = [
      function () {
        return function f () {
          f.self = this
          f.args = arguments
          // no return
        }
      },
      function () {
        return function f () {
          f.self = this
          f.args = arguments
          return false
        }
      },
      function () {
        return function f () {
          f.self = this
          f.args = arguments
          return true
        }
      },
      function () {
        return function f () {
          f.self = this
          f.args = arguments
          throw new Error('This condition fails with an error')
        }
      }
    ]

    conditionCases.forEach(function (conditionGenerator) {
      selfVerifyCases.forEach(function (selfGenerator) {
        argsVerifyCases.forEach(function (argGenerator) {
          const subject = oneSubjectGenerator()
          const condition = conditionGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          const contractFunction = common.createCandidateContractFunction()
          const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))
          describe('works for ' + condition + ' - ' + self + ' - ' + args, function () {
            let exception
            try {
              subject.verify(contractFunction, condition, self, doctoredArgs)
            } catch (exc) {
              exception = exc
            }
            expectPost(subject, contractFunction, condition, self, args, doctoredArgs, condition.self, condition.args, exception)
          })
        })
      })
    })
  })

  describe('#verifyAll()', function () {
    function expectPost (subject, contractFunction, conditions, self, args, doctoredArgs, exception) {
      if (conditions.length <= 0) {
        it("doesn't throw an exception if there are no conditions", function () {
          exception.must.be.falsy()
        })
        return
      }
      const selfAndArgs = conditions.map(condition => {
        // save self and args, because in our determination of firstFailure, they will be overwritten
        return {self: condition.self, args: condition.args}
      })
      let firstFailure
      let firstFailureIndex
      let thrown
      for (let i = 0; !firstFailure && i < conditions.length; i++) {
        try {
          const outcome = conditions[i].apply()
          if (!outcome) {
            firstFailure = conditions[i]
            firstFailureIndex = i
          }
        } catch (err) {
          firstFailure = conditions[i]
          firstFailureIndex = i
          thrown = err
        }
      }
      it('throws an exception if one of the conditions fails or evaluates nominally to false', function () {
        const e = !!exception
        e.must.equal(!!firstFailure)
      })
      if (thrown) {
        it('throws a ConditionMetaError if one of the conditions fails', function () {
          // noinspection JSUnresolvedFunction
          conditionMetaErrorCommon.expectProperties(exception, ConditionMetaError, contractFunction, firstFailure, self, doctoredArgs)
        })
      } else if (firstFailure) {
        it('throws a …ConditionViolation if one of the conditions evaluates nominally to false', function () {
          const extraProperty = doctoredArgs[args.length] // might not exist
          that.expectProperties(exception, subject.constructor, contractFunction, firstFailure, self, args, extraProperty)
        })
      } else {
        it('ends nominally if all conditions evaluate nominally to true', function () {
          exception.must.be.falsy()
        })
      }
      it('evaluates all conditions up until the first failure with the given self and arguments', function () {
        for (let j = 0; j <= firstFailureIndex; j++) {
          selfAndArgs[j].self.must.equal(self)
          const appliedArgs = selfAndArgs[j].args
          appliedArgs.must.be.truthy()
          isArguments(appliedArgs)
          if (!args) {
            appliedArgs.must.be.empty()
          } else {
            // doctoredArgs might be arguments, or Array
            Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(appliedArgs))
          }
        }
      })
      it('does not evaluate conditions after the first failure', function () {
        for (let j = firstFailureIndex + 1; j < conditions.length; j++) {
          selfAndArgs[j].self.must.be.falsy()
          selfAndArgs[j].args.must.be.falsy()
        }
      })
      it('adheres to the invariants', function () {
        that.expectInvariants(subject)
      })
    }

    const conditionsCases = [
      function () { return [] },
      function () {
        return [
          function f () {
            f.self = this
            f.args = arguments
            return false
          }
        ]
      },
      function () {
        return [
          function f () {
            f.self = this
            f.args = arguments
            return true
          }
        ]
      },
      function () {
        return [
          function f () {
            f.self = this
            f.args = arguments
            return {}
          }
        ]
      },
      function () {
        return [
          function f1 () {
            f1.self = this
            f1.args = arguments
            return true
          },
          function f2 () {
            f2.self = this
            f2.args = arguments
            return true
          }
        ]
      },
      function () {
        return [
          function f1 () {
            f1.self = this
            f1.args = arguments
            return true
          },
          function f2 () {
            f2.self = this
            f2.args = arguments
            return false
          },
          function f3 () {
            f3.self = this
            f3.args = arguments
            return true
          }
        ]
      },
      function () {
        return [
          function f1 () {
            f1.self = this
            f1.args = arguments
            return true
          },
          function f3 () {
            f3.self = this
            f3.args = arguments
            throw new Error('This condition fails with an error')
          },
          function f3 () {
            f3.self = this
            f3.args = arguments
            return true
          }
        ]
      }
    ]

    conditionsCases.forEach(conditionsGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const subject = oneSubjectGenerator()
          const conditions = conditionsGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          const contractFunction = common.createCandidateContractFunction()
          const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))
          describe('works for ' + conditions + ' - ' + self + ' - ' + args, function () {
            let exception
            try {
              // noinspection JSUnresolvedFunction
              subject.verifyAll(contractFunction, conditions, self, doctoredArgs)
            } catch (exc) {
              exception = exc
            }
            expectPost(subject, contractFunction, conditions, self, args, doctoredArgs, exception)
          })
        })
      })
    })
  })
}

const test = {
  selfVerifyCases: selfVerifyCases,
  argsVerifyCases: argsVerifyCases,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
  expectInvariants: expectInvariants,
  expectProperties: expectProperties,
  doctorArgs: doctorArgs
}
Object.setPrototypeOf(test, common)

module.exports = test
