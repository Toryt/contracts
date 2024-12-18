/*
 * Copyright 2023 PeopleWare n.v.
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

const path = require('node:path')
const assert = require('assert')

const namePattern = /^(.*)\.test$/

/**
 * Return the name of a test from the module name.
 * Only use when this makes sense.
 *
 * @param {object} testModule
 * @returns {string}
 */
function testName(testModule) {
  let parts = path.parse(testModule.filename)
  const nameSplit = namePattern.exec(parts.name)
  assert(nameSplit.length === 2)
  let name = nameSplit[1]
  while (path.basename(parts.dir) !== 'test') {
    parts = path.parse(parts.dir)
    name = `${parts.base}/${name}`
  }
  return name
}

module.exports = testName
