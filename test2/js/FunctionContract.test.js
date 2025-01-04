/*
  Copyright 2024–2025 Jan Dockx

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

import { FunctionContract, isContractFunction } from '../../build/src/index.js'
import { generateStuff } from '../../build/test2/util/_stuff.js'
import { inspect } from 'node:util'
import { noArguments } from '../../build/test2/util/SomeSignatures.js'

function appendToArray(arr) {
  arr.push(() => true)
}

function modifyArray(arr) {
  arr[0] = 'something else'
}

function invariants(subject) {
  subject.should.have.property('post')
  const posts = subject.post
  posts.should.be.an.Array()
  Object.isFrozen(posts).should.be.true()
  posts.forEach(p => p.should.be.a.Function())
  appendToArray.bind(undefined, posts).should.throw()
  modifyArray.bind(undefined, posts).should.throw()
}

describe('FunctionContract', function () {
  describe('construction', function () {
    function verifyPost(kwargs, subject) {
      invariants(subject)
      subject.post.should.deepEqual(kwargs.post ?? [])
    }

    describe('nominal', function () {
      it('should initialize with an empty postconditions array by default when kwargs are given', function () {
        const kwargs = {}

        const subject = new FunctionContract(kwargs)

        verifyPost(kwargs, subject)
      })

      it('should initialize with an empty postconditions array when an empty array is given', function () {
        const kwargs = { post: [] }

        const subject = new FunctionContract(kwargs)

        verifyPost(kwargs, subject)
      })

      it('should allow initializing postconditions via constructor', function () {
        const kwargs = {
          post: [
            function (args, result) {
              return result > args[0]
            },
            function (args, result) {
              return result === args[1]
            }
          ]
        }

        const subject = new FunctionContract(kwargs)

        verifyPost(kwargs, subject)
      })

      it('should not be affected by modifications to the original postconditions array', function () {
        const kwargs = {
          post: [
            function (args, result) {
              return result > args[0]
            }
          ]
        }
        const contract = new FunctionContract(kwargs)
        contract.post.should.have.length(1)

        kwargs.post.push(function (args, result) {
          return result === args[1]
        })
        contract.post.should.have.length(1)
      })
    })

    describe('preconditions', function () {
      it('fails without kwargs', function () {
        function createWithoutKwargs() {
          return new FunctionContract()
        }

        createWithoutKwargs.should.throw()
      })

      function createWith(kwargs) {
        return new FunctionContract(kwargs)
      }

      describe('kwargs is strange stuff', function () {
        generateStuff()
          .filter(({ subject }) => typeof subject !== 'object')
          .forEach(({ subject, expected }) => {
            it(`fails when kwargs are ${expected} ${inspect(subject)}`, function () {
              createWith.bind(undefined, subject).should.throw()
            })
          })
      })

      describe('kwargs.post is strange stuff', function () {
        generateStuff()
          .filter(({ expected }) => expected !== 'undefined')
          .forEach(({ subject, expected }) => {
            it(`fails when kwargs.post is ${expected} ${inspect(subject)}`, function () {
              createWith.bind(undefined, { post: subject }).should.throw()
            })
          })
      })

      describe('kwargs.post is array of strange stuff', function () {
        generateStuff()
          .filter(({ expected }) => expected !== 'function')
          .forEach(({ subject, expected }) => {
            it(`fails when kwargs.post has ${expected} ${inspect(subject)} as element`, function () {
              createWith.bind(undefined, { post: [subject] }).should.throw()
            })
          })
      })
    })
  })

  describe('implementation', function () {
    beforeEach(function () {
      this.subject = new FunctionContract({})
    })

    it('should accept a function conforming to the generic signature', function () {
      function correctSignature(a, b) {
        return a * b
      }

      const result = this.subject.implementation(correctSignature)
      result.should.have.property('contract')
      result.contract.should.equal(this.subject)

      result.should.equal(correctSignature)
      result(2, 3).should.equal(6)
    })

    it('accepts a function not conforming to the generic signature in JavaScript', function () {
      function wrongSignature(a, b, c) {
        return a + b + c
      }

      const result = this.subject.implementation(wrongSignature)
      result.should.have.property('contract')
      result.contract.should.equal(this.subject)

      result.should.equal(wrongSignature)
      result(2, 3, 1).should.equal(6)
    })

    describe('not a function', function () {
      it('should throw when `implementation` is called without arguments', function () {
        this.subject.implementation.bind(undefined).should.throw()
      })
      generateStuff()
        .filter(({ expected }) => expected !== 'function')
        .forEach(({ subject, expected }) => {
          it(`should throw when \`implementation\` is called with ${expected} ${inspect(subject)}`, function () {
            this.subject.implementation.bind(undefined, subject).should.throw()
          })
        })
    })
  })
})

describe('isContractFunction', function () {
  it('accepts a contract function', function () {
    const contract = new FunctionContract({})
    const subject = contract.implementation(noArguments)

    isContractFunction(subject).should.be.true()
  })

  describe('not a contract function', function () {
    generateStuff().forEach(({ subject, expected }) => {
      it(`should say ${expected} ${inspect(subject)} is not a contract function`, function () {
        isContractFunction(subject).should.be.false()
      })
    })
  })
})
