/*
 Copyright 2016 - 2018 by Jan Dockx

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
const ConditionMetaError = require('../../lib/IV/ConditionMetaError')
const ConditionViolation = require('../../lib/IV/ConditionViolation')
const conditionMetaErrorCommon = require('./ConditionMetaErrorCommon')
const must = require('must')

function isArguments (o) {
  const str = '' + o
  str.must.equal('[object Arguments]')
}

const selfVerifyCases = [
  function () {
    return undefined
  },
  function () {
    return null
  },
  function () {
    return {}
  }
]

function args () {
  return arguments
}

const argsVerifyCases = [
  function () {
    return args()
  },
  function () {
    return args('an argument')
  },
  function () {
    return args('an argument', 'another argument')
  },
  function () {
    return ['an argument in an array']
  }
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

function expectConstructorPost (result, contractFunction, condition, self, args) {
  // noinspection JSUnresolvedVariable
  common.expectConstructorPost(result, contractFunction, condition, self, args, result._rawStack)
  common.expectProperties.call(undefined, result, ConditionViolation, contractFunction, condition, self, args)
  // not frozen yet
}

// noinspection JSUnusedLocalSymbols
function doctorArgs (args, boundContractFunction) {
  return args
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  const that = this

  const verifyConditionCases = [
    () =>
      function f () {
        f.self = this
        f.args = arguments
        // no return
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return false
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return true
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        throw new Error('This condition fails with an error')
      }
  ]

  const verifyPromiseConditionCases = [
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return Promise.resolve()
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return Promise.resolve(false)
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return Promise.resolve(true)
      },
    () =>
      function f () {
        f.self = this
        f.args = arguments
        return Promise.reject(new Error('This condition fails with an error'))
      }
  ]

  describe('#verify()', function () {
    verifyConditionCases.forEach(conditionGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const condition = conditionGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          it('works for ' + condition + ' - ' + self + ' - ' + args, function () {
            const subject = oneSubjectGenerator()
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))
            let outcome
            let metaError = false
            try {
              outcome = condition.apply()
            } catch (ignore) {
              // ConditionMetaError
              metaError = true
            }
            try {
              subject.verify(contractFunction, condition, self, doctoredArgs)
              outcome.must.be.truthy() // otherwise, we get an exception
              must(metaError).be.falsy()
            } catch (exc) {
              if (metaError) {
                // noinspection JSUnresolvedFunction
                conditionMetaErrorCommon.expectProperties(
                  exc,
                  ConditionMetaError,
                  contractFunction,
                  condition,
                  self,
                  doctoredArgs
                )
              } else {
                // ConditionViolation
                must(outcome).be.falsy()
                const extraProperty = doctoredArgs[args.length] // might not exist
                that.expectProperties(exc, subject.constructor, contractFunction, condition, self, args, extraProperty)
              }
            } finally {
              must(condition.self).equal(self)
              condition.args.must.be.truthy()
              isArguments(condition.args)
              // doctoredArgs might be arguments, or Array
              Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(condition.args))
              that.expectInvariants(subject)
            }
          })
        })
      })
    })
  })

  describe('#verifyPromise()', function () {
    verifyConditionCases.forEach(conditionGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const condition = conditionGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          it('works for ' + condition + ' - ' + self + ' - ' + args, function () {
            const subject = oneSubjectGenerator()
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

            let outcome
            let metaError = false
            try {
              outcome = condition.apply()
            } catch (ignore) {
              // ConditionMetaError
              metaError = true
            }

            return subject
              .verifyPromise(contractFunction, condition, self, doctoredArgs)
              .then(
                () => {
                  outcome.must.be.truthy() // otherwise, we get an exception
                  must(metaError).be.falsy()
                },
                exc => {
                  if (metaError) {
                    // noinspection JSUnresolvedFunction
                    conditionMetaErrorCommon.expectProperties(
                      exc,
                      ConditionMetaError,
                      contractFunction,
                      condition,
                      self,
                      doctoredArgs
                    )
                  } else {
                    // ConditionViolation
                    must(outcome).be.falsy()
                    const extraProperty = doctoredArgs[args.length] // might not exist
                    that.expectProperties(
                      exc,
                      subject.constructor,
                      contractFunction,
                      condition,
                      self,
                      args,
                      extraProperty
                    )
                  }
                }
              )
              .then(() => {
                must(condition.self).equal(self)
                condition.args.must.be.truthy()
                isArguments(condition.args)
                // doctoredArgs might be arguments, or Array
                Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(condition.args))
                that.expectInvariants(subject)
              })
          })
        })
      })
    })
    verifyPromiseConditionCases.forEach(conditionGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const condition = conditionGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          it('works for Promise condition ' + condition + ' - ' + self + ' - ' + args, function () {
            const subject = oneSubjectGenerator()
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

            return condition
              .apply()
              .then(outcome => {
                return subject.verifyPromise(contractFunction, condition, self, doctoredArgs).then(
                  () => {
                    outcome.must.be.truthy() // otherwise, we get an exception
                  },
                  exc => {
                    // ConditionViolation
                    must(outcome).be.falsy()
                    const extraProperty = doctoredArgs[args.length] // might not exist
                    that.expectProperties(
                      exc,
                      subject.constructor,
                      contractFunction,
                      condition,
                      self,
                      args,
                      extraProperty
                    )
                  }
                )
              })
              .catch(() => {
                return subject.verifyPromise(contractFunction, condition, self, doctoredArgs).then(
                  () => {
                    false.must.be.true() // should not happen
                  },
                  exc => {
                    // noinspection JSUnresolvedFunction
                    conditionMetaErrorCommon.expectProperties(
                      exc,
                      ConditionMetaError,
                      contractFunction,
                      condition,
                      self,
                      doctoredArgs
                    )
                  }
                )
              })
              .then(() => {
                must(condition.self).equal(self)
                condition.args.must.be.truthy()
                isArguments(condition.args)
                // doctoredArgs might be arguments, or Array
                Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(condition.args))
                that.expectInvariants(subject)
              })
          })
        })
      })
    })
  })

  const verifyAllConditionsCases = [
    () => [],
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return false
      }
    ],
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return true
      }
    ],
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return {}
      }
    ],
    () => [
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
    ],
    () => [
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
    ],
    () => [
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
  ]

  describe('#verifyAll()', function () {
    verifyAllConditionsCases.forEach(conditionsGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const conditions = conditionsGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          const conditionsRepr = conditions.map(c => ('' + c).replace(/\s+/g, ' ')).join(', ')
          // noinspection FunctionTooLongJS
          it('works for [' + conditionsRepr + '] - ' + self + ' - ' + args, function () {
            const subject = oneSubjectGenerator()
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

            let firstFailure
            let firstFailureIndex
            let metaError = false
            for (let i = 0; !firstFailure && i < conditions.length; i++) {
              try {
                const outcome = conditions[i].apply()
                if (!outcome) {
                  firstFailure = conditions[i]
                  firstFailureIndex = i
                }
              } catch (ignore) {
                // ConditionMetaError
                metaError = true
                firstFailure = conditions[i]
                firstFailureIndex = i
              }
            }

            try {
              // noinspection JSUnresolvedFunction
              subject.verifyAll(contractFunction, conditions, self, doctoredArgs)
              must(firstFailure).be.falsy() // any failure would give an exception
              must(metaError).be.falsy()
            } catch (exc) {
              conditions.length.must.be.at.least(1) // otherwise, there can be no failure
              firstFailure.must.be.truthy() // metaError or a false condition
              if (metaError) {
                conditionMetaErrorCommon.expectProperties(
                  exc,
                  ConditionMetaError,
                  contractFunction,
                  firstFailure,
                  self,
                  doctoredArgs
                )
              } else {
                const extraProperty = doctoredArgs[args.length] // might not exist
                that.expectProperties(
                  exc,
                  subject.constructor,
                  contractFunction,
                  firstFailure,
                  self,
                  args,
                  extraProperty
                )
              }
            } finally {
              // evaluates all conditions up until the first failure with the given self and arguments
              for (let j = 0; j <= firstFailureIndex; j++) {
                must(conditions[j].self).equal(self)
                const appliedArgs = conditions[j].args
                appliedArgs.must.be.truthy()
                isArguments(appliedArgs)
                if (!args) {
                  appliedArgs.must.be.empty()
                } else {
                  // doctoredArgs might be arguments, or Array
                  Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(appliedArgs))
                }
              }
              // does not evaluate conditions after the first failure
              for (let j = firstFailureIndex + 1; j < conditions.length; j++) {
                must(conditions[j].self).be.falsy()
                must(conditions[j].args).be.falsy()
              }
              that.expectInvariants(subject)
            }
          })
        })
      })
    })
  })

  const verifyAllPromiseConditionsCases = verifyAllConditionsCases.concat([
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return Promise.resolve(false)
      }
    ],
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return Promise.resolve(true)
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return Promise.resolve(true)
      },
      function f2 () {
        f2.self = this
        f2.args = arguments
        return Promise.resolve(true)
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return Promise.resolve(true)
      },
      function f2 () {
        f2.self = this
        f2.args = arguments
        return Promise.resolve(false)
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return Promise.resolve(true)
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return Promise.resolve(true)
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return Promise.reject(new Error('This condition fails with an error'))
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return Promise.resolve(true)
      }
    ],
    // mixed
    () => [
      function f () {
        f.self = this
        f.args = arguments
        return {}
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return true
      },
      function f2 () {
        f2.self = this
        f2.args = arguments
        return Promise.resolve(true)
      }
    ],
    () => [
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
        return Promise.resolve(true)
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return true
      },
      function f2 () {
        f2.self = this
        f2.args = arguments
        return Promise.resolve(false)
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return Promise.resolve(true)
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return true
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return Promise.reject(new Error('This condition fails with an error'))
      },
      function f3 () {
        f3.self = this
        f3.args = arguments
        return true
      }
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return Promise.resolve(true)
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
    ],
    () => [
      function f1 () {
        f1.self = this
        f1.args = arguments
        return Promise.resolve(false)
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
  ])

  describe('#verifyAllPromise()', function () {
    verifyAllPromiseConditionsCases.forEach(conditionsGenerator => {
      selfVerifyCases.forEach(selfGenerator => {
        argsVerifyCases.forEach(argGenerator => {
          const conditions = conditionsGenerator()
          const self = selfGenerator()
          const args = argGenerator()
          const conditionsRepr = conditions.map(c => ('' + c).replace(/\s+/g, ' ')).join(', ')
          it('works for [' + conditionsRepr + '] - ' + self + ' - ' + args, function () {
            const subject = oneSubjectGenerator()
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

            const failures = []
            let metaErrorCondition = null // only 1 meta error per test case

            function determineExpected (i) {
              if (i >= conditions.length) {
                return Promise.resolve()
              }

              try {
                const outcome = conditions[i].apply()
                if (outcome instanceof Promise) {
                  return outcome
                    .then(result => {
                      if (!result) {
                        failures.push(conditions[i])
                      }
                    })
                    .catch(() => {
                      metaErrorCondition = conditions[i]
                      failures.push(conditions[i])
                    })
                    .then(() => determineExpected(i + 1))
                }
                if (!outcome) {
                  failures.push(conditions[i])
                }
              } catch (ignore) {
                // ConditionMetaError
                metaErrorCondition = conditions[i]
                failures.push(conditions[i])
              }
              return determineExpected(i + 1)
            }

            const expectedDetermined = determineExpected(0)

            // noinspection JSUnresolvedFunction
            return expectedDetermined.then(() =>
              subject
                .verifyAllPromise(contractFunction, conditions, self, doctoredArgs)
                .then(
                  () => {
                    failures.must.be.empty() // any failure would give an exception
                    must(metaErrorCondition).be.falsy()
                  },
                  exc => {
                    conditions.length.must.be.at.least(1) // otherwise, there can be no failure
                    failures.must.not.be.empty()
                    if (metaErrorCondition) {
                      conditionMetaErrorCommon.expectProperties(
                        exc,
                        ConditionMetaError,
                        contractFunction,
                        metaErrorCondition,
                        self,
                        doctoredArgs
                      )
                    } else {
                      const extraProperty = doctoredArgs[args.length] // might not exist
                      that.expectProperties(
                        exc,
                        subject.constructor,
                        contractFunction,
                        failures[0], // works in tests, but the order is really indeterminate
                        self,
                        args,
                        extraProperty
                      )
                    }
                  }
                )
                .then(() => {
                  // evaluates all conditions, also past first failure with, the given self and arguments
                  conditions.forEach(c => {
                    must(c.self).equal(self)
                    const appliedArgs = c.args
                    appliedArgs.must.be.truthy()
                    isArguments(appliedArgs)
                    if (!args) {
                      appliedArgs.must.be.empty()
                    } else {
                      // doctoredArgs might be arguments, or Array
                      Array.prototype.slice.call(doctoredArgs).must.eql(Array.prototype.slice.call(appliedArgs))
                    }
                  })
                  that.expectInvariants(subject)
                })
            )
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
  expectConstructorPost: expectConstructorPost,
  doctorArgs: doctorArgs
}
Object.setPrototypeOf(test, common)

module.exports = test
