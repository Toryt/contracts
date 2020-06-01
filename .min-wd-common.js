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
         - we stick to High Sierra for Safari
         - we do not test on Firefox, until the issue is fixed.
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

function createConfig (definition) {
  return {
    hostname: 'hub-cloud.browserstack.com',
    port: 80,
    browsers: [definition]
  }
}

function desktop (definition) {
  return createConfig({
    name: `${definition.browser} - ${definition.os} ${definition.os_version || osVersion[os]}`,
    capabilities: Object.assign(
      {},
      capabilitiesBase,
      {
        os_version: osVersion[os]
      },
      definition // overwrite general settings
    )
  })
}

function mobile (device) {
  return createConfig({
    name: device,
    capabilities: Object.assign(
      {
        device,
        real_mobile: true
      },
      capabilitiesBase
    )
  })
}

module.exports = {
  desktop,
  mobile
}
