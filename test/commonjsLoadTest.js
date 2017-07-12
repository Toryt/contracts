#!/usr/local/bin/node

/*
 Copyright 2016 - 2017 by Jan Dockx

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
var modules = {
  _private: {
    util: require("../src/_private/util")
  },
  I : {
    AbstractContract: require("../src/III/AbstractContract"),
    ConditionError: require("../src/III/ConditionError"),
    ConditionMetaError: require("../src/III/ConditionMetaError"),
    ConditionViolation: require("../src/III/ConditionViolation"),
    Contract: require("../src/III/Contract"),
    ContractError: require("../src/III/ContractError"),
    ExceptionConditionViolation: require("../src/III/ExceptionConditionViolation"),
    PostconditionViolation: require("../src/III/PostconditionViolation"),
    PreconditionViolation: require("../src/III/PreconditionViolation")
  }
};

console.log(modules.I.AbstractContract.root.location);
