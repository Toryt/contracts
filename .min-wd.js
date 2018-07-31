/* Note: Firefox tests work up until version 58. After that, Selenium has a problem:
         POST /session/14641de4c7f12c2f9b2eaf307a0955edf23dc59b/timeouts/async_script did not match a known command
         No combination of browserstack.geckodriver and browserstack.selenium_version that worked was found.
         The solution is to call mochify with `--async-polling false`. */

const travisBuild = process.env.TRAVIS_BUILD_NUMBER
const build = travisBuild
  ? `travis/${travisBuild.padStart(5, '0')}`
  : `manual ${new Date().toISOString()}`
console.log(`build: ${build}`)

const capabilitiesBase = {
  project: 'Toryt contracts',
  build: build,
  'browserstack.console': 'verbose',
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY
}

const osVersion = {
  'OS X': 'High Sierra',
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
  { browser: 'Chrome', os: 'OS X', os_version: 'High Sierra' },
  { browser: 'Safari', os: 'OS X', os_version: 'High Sierra' },
  { browser: 'Firefox', os: 'OS X', os_version: 'High Sierra' },
  { browser: 'Chrome', os: 'Windows', os_version: '10' },
  { browser: 'Edge', os: 'Windows', os_version: '10' },
  { browser: 'Firefox', os: 'Windows', os_version: '10' }
].map(d => ({
  name: `${d.browser} - ${d.os}`,
  capabilities: Object.assign(d, capabilitiesBase, {
    os_version: osVersion[d.os]
  })
}))
const mobile = [
  'Samsung Galaxy S9',
  'Samsung Galaxy Note 4',
  'iPhone X',
  'iPad Pro'
].map(m => ({
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
