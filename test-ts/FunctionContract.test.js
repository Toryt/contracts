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
    const contract = new FunctionContract((x, y) => x + y)

    function correctSignature(a, b) {
      return a * b
    }

    const result = contract.implementation(correctSignature)

    result.should.equal(correctSignature)
    result(2, 3).should.equal(6)
  })

  it('should reject a function not conforming to the generic signature', function () {
    const contract = new FunctionContract((x, y) => x + y)

    function wrongSignature(a, b, c) {
      return a + b + c
    }

    contract.implementation(wrongSignature).bind(undefined).should.throw()
  })
})
