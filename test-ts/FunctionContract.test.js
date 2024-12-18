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

import { FunctionContract } from '../dist/FunctionContract.js'

describe('FunctionContract', function () {
  it('should accept a function conforming to the generic signature', function () {
    const contract = new FunctionContract()

    function correctSignature(a, b) {
      return a * b
    }

    const result = contract.implementation(correctSignature)
    result.should.have.property('contract')
    result.contract.should.equal(contract)

    result.should.equal(correctSignature)
    result(2, 3).should.equal(6)
  })

  describe('implementation', function () {
    it('should accept a function conforming to the generic signature', function () {
      const contract = new FunctionContract()

      function correctSignature(a, b) {
        return a * b
      }

      const result = contract.implementation(correctSignature)
      result.should.have.property('contract')
      result.contract.should.equal(contract)

      result.should.equal(correctSignature)
      result(2, 3).should.equal(6)
    })

    it('accepts a function not conforming to the generic signature in JavaScript', function () {
      const contract = new FunctionContract()

      function wrongSignature(a, b, c) {
        return a + b + c
      }

      const result = contract.implementation(wrongSignature)
      result.should.have.property('contract')
      result.contract.should.equal(contract)

      result.should.equal(wrongSignature)
      result(2, 3, 1).should.equal(6)
    })

    describe('not a function', function () {
      generateStuff().forEach(s => {
        it(`should throw when \`implementation\` is called with ${inspect(s)}`, function () {
          const contract = new FunctionContract()

          contract.implementation.bind(undefined, s).should.throw()
        })
      })
    })
  })
})
