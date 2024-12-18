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

/*
 * Copyright 2023 PeopleWare n.v.
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { parse, basename } from 'node:path'
import assert from 'assert'

const namePattern = /^(.*)\.test$/

/**
 * Return the name of a test from the module name.
 * Only use when this makes sense.
 *
 * @param {object} testModule
 * @returns {string}
 */
export default function testName(testModule) {
  let parts = parse(testModule.filename)
  const nameSplit = namePattern.exec(parts.name)
  assert(nameSplit.length === 2)
  let name = nameSplit[1]
  while (basename(parts.dir) !== 'test') {
    parts = parse(parts.dir)
    name = `${parts.base}/${name}`
  }
  return name
}
