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

/* Note: Firefox tests work up until version 58. After that, Selenium has a problem:
         POST /session/14641de4c7f12c2f9b2eaf307a0955edf23dc59b/timeouts/async_script did not match a known command
         No combination of browserstack.geckodriver and browserstack.selenium_version that worked was found.
         The solution is to call mochify with `--async-polling false`.

         This worked up until version 63.

         The last successful run was Travis/00651, d.d. 2018-12-22. Something changed at Browserstack that makes the run
         fail for Firefox since Travis/654 d.d. 2018-12-29, both for High Sierra and Windows 10.

         POST /wd/hub/session/37637d38c9bda442465f1e454894638aca029384/execute
         Unexpected HTTP status: 404 Not Found
         […]
         Response Message:
            POST /session/37637d38c9bda442465f1e454894638aca029384/execute did not match a known command

         We get the same problem with Firefox 63 and 64, and also on Mojave.
         The same problem also occurs with Safari 12 on Mojave.

         A simple 1-test demonstration is at tag `failure/firefox-browserstack-problem/Travis00666`, run Travis/00666.

         To work around this for the time being,

         * we stick to High Sierra for Safari
         * we do not test on Firefox, until the issue is fixed.
*/

const travisBuild = process.env.TRAVIS_BUILD_NUMBER
const build = travisBuild ? `travis/${travisBuild.padStart(5, '0')}` : `manual ${new Date().toISOString()}`
console.log(`build: ${build}`)

const capabilitiesBase = {
  project: 'Toryt contracts',
  build: build,
  'browserstack.video': false,
  'browserstack.console': 'verbose',
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY
}

const osVersion = {
  'OS X': 'Mojave',
  Windows: '10'
}

/* We only test the last version of every combination, by not specifying any version.
   By running the tests every week, we stay compatible. */

/* NOTE:
    Safari eats stack traces in Web Driver mode (not when tested manually), and skips stack frames in general.
    Safari on iOS does very weird things with sometimes not setting a prototype property on new (non arrow) functions,
    or setting them 'late'. Some workarounds in tests are provided for this.

    Firefox only works with with `--async-polling false`.
    In general, runs on all browsers are more stable with `--async-polling false` (though a tad slower).

    Edge has trouble with the contract function name (test workaround)
 */

const desktop = [
  { browser: 'Chrome', os: 'Windows' },
  { browser: 'Edge', os: 'Windows' },
  // NOTE: see top { browser: 'Firefox', browser_version: '63.0', os: 'Windows' }
  { browser: 'Chrome', os: 'OS X' },
  { browser: 'Safari', os: 'OS X', os_version: 'High Sierra' } // NOTE: see top
  // NOTE: see top { browser: 'Firefox', browser_version: '63.0', os: 'OS X' }
].map(d => ({
  name: `${d.browser} - ${d.os} ${d.os_version || osVersion[d.os]}`,
  capabilities: Object.assign(
    {},
    capabilitiesBase,
    {
      os_version: osVersion[d.os]
    },
    d // overwrite general settings
  )
}))
const mobile = ['Samsung Galaxy S9', 'Samsung Galaxy Note 4', 'iPhone X', 'iPad Pro'].map(m => ({
  name: m,
  capabilities: Object.assign(
    {
      device: m,
      real_mobile: true
    },
    capabilitiesBase
  )
}))

const definitions = desktop.concat(mobile)
console.log(`${definitions.length}:`, definitions.map(d => d.name).join(', '))

module.exports = {
  hostname: 'hub-cloud.browserstack.com',
  port: 80,
  browsers: definitions
}
