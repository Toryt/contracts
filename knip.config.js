/*
 * Copyright 2025 PeopleWare n.v.
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

module.exports = {
  entry: ['test/**/*Test.js', '.min-wd{,-*}.js'], // `main` (`lib/index.js`) is added by knip
  project: ['**/*.{js,json}', '!scripts/common/**'],
  /* Explicit mention of prettier and mocha dependencies to avoid false positives in the current version of knip.
     Or is this a configuration issue? */
  ignoreDependencies: ['mocha'],
  treatConfigHintsAsErrors: true
}
