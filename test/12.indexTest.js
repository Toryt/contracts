/*
  Copyright 2016–2024 Jan Dockx

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

'use strict'

const index = require('../lib/index')
const AbstractContract = require('../lib/AbstractContract')
const ConditionError = require('../lib/ConditionError')
const ConditionMetaError = require('../lib/ConditionMetaError')
const ConditionViolation = require('../lib/ConditionViolation')
const Contract = require('../lib/Contract')
const ContractError = require('../lib/ContractError')
const ExceptionConditionViolation = require('../lib/ExceptionConditionViolation')
const PostconditionViolation = require('../lib/PostconditionViolation')
const PreconditionViolation = require('../lib/PreconditionViolation')
const PromiseContract = require('../lib/PromiseContract')

describe('index', function () {
  it('exports expected properties', function () {
    index.ContractError.should.equal(ContractError)
    index.AbstractContract.should.equal(AbstractContract)
    index.ConditionError.should.equal(ConditionError)
    index.ConditionMetaError.should.equal(ConditionMetaError)
    index.ConditionViolation.should.equal(ConditionViolation)
    index.PreconditionViolation.should.equal(PreconditionViolation)
    index.PostconditionViolation.should.equal(PostconditionViolation)
    index.ExceptionConditionViolation.should.equal(ExceptionConditionViolation)
    index.Contract.should.equal(Contract)
    index.PromiseContract.should.equal(PromiseContract)
  })
})
