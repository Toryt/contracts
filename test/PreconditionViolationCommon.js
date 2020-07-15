/*
 Copyright 2016 - 2020 by Jan Dockx

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

const common = require('./ConditionViolationCommon')
const PreconditionViolation = require('../lib/PreconditionViolation')

function expectInvariants (subject) {
  subject.should.be.an.instanceof(PreconditionViolation)
  common.expectInvariants(subject)
}

const test = {
  expectInvariants: expectInvariants
}
Object.setPrototypeOf(test, common)

module.exports = test