#!/usr/local/bin/node

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

/**
 * This test just tries to load all the modules of the library via the native commonjs loader, without other
 * intervening software.
 * This test was written to show a problem discovered while trying to use the library through npm the first time.
 * It turned out that, when loading AbstractContract (indirectly via Contract), the library failed when creating
 * AbstractContract.root, because there was no "location outside the library" from which it was called
 * (defined as not in ../src, and not native code).
 *
 * This should be run as a direct command
 * | > node test/commonjsLoadTest.js
 */
const modules = {
  testUtil: require('./_util/testUtil'),
  _private: {
    util: require('../lib/_private/util')
  },
  IV: {
    AbstractContract: require('../lib/IV/AbstractContract'),
    ConditionError: require('../lib/IV/ConditionError'),
    ConditionMetaError: require('../lib/IV/ConditionMetaError'),
    ConditionViolation: require('../lib/IV/ConditionViolation'),
    Contract: require('../lib/IV/Contract'),
    ContractError: require('../lib/IV/ContractError'),
    ExceptionConditionViolation: require('../lib/IV/ExceptionConditionViolation'),
    PostconditionViolation: require('../lib/IV/PostconditionViolation'),
    PreconditionViolation: require('../lib/IV/PreconditionViolation')
  }
}

modules.testUtil.log(modules.IV.AbstractContract.root.location.toString())
