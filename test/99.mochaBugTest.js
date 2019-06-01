/*
 Copyright 2019 - 2019 by Jan Dockx

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

const Contract = require('../lib/IV/Contract')
const cases = require('./_cases')

const contract = new Contract({ pre: [cases.intentionallyFailingFunction] })

describe('mocha this', function () {
  before(function () {
    this.subject = contract.implementation(function () {})
  })

  it('works when a precondition violation occurs when a function is called with a mocha fixture as this', function () {
    this.subject()
  })
})
