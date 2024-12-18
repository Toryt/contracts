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

import { add } from '../dist/experimental.js'

describe('add', function () {
  it('should return the sum of two numbers', function () {
    const result = add(2, 3)
    result.should.equal(5)
  })

  it('should handle negative numbers', function () {
    const result = add(-2, -3)
    result.should.equal(-5)
  })

  it('should handle 3 args', function () {
    const result = add(-2, -3, 6)
    result.should.equal(1)
  })
})