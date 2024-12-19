/*
  Copyright 2024 Jan Dockx

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

import { FunctionContract } from '../../dist/FunctionContract.js'
import { generateStuff } from '../dist/test2/util/_stuff.js'
import { inspect } from 'node:util'

describe('FunctionContract', function () {
  describe('construction', function () {
    function verifyPost(contract) {
      contract.should.have.property('post')
      contract.post.should.be.an.Array()
      Object.isFrozen(contract.post).should.be.true()
      contract.post.forEach(p => p.should.be.a.Function())
    }

    describe('nominal', function () {
      it('should initialize with an empty postconditions array by default when kwargs are given', function () {
        const contract = new FunctionContract({})
        verifyPost(contract)
        contract.post.should.be.empty()
      })

      it('should allow initializing postconditions via constructor', function () {
        const post = [
          function (args, result) {
            return result > args[0]
          },
          function (args, result) {
            return result === args[1]
          }
        ]
        const contract = new FunctionContract({ post })

        verifyPost(contract)
        contract.post.should.deepEqual(post)
      })

      it('should not allow modifications to the postconditions array', function () {
        const post = [
          function (args, result) {
            return result > args[0]
          }
        ]
        const contract = new FunctionContract({ post })

        function append() {
          contract.post.push(() => true)
        }
        append.should.throw()

        function modify() {
          contract.post[0] = () => false
        }
        modify.should.throw()
      })

      it('should not be affected by modifications to the original postconditions array', function () {
        const post = [
          function (args, result) {
            return result > args[0]
          }
        ]
        const contract = new FunctionContract({ post })

        post.push(function (args, result) {
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
