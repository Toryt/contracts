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
  'Windows': '10'
}

/* We only test the last version of every combination, by not specifying any version.
   By running the tests every week, we stay compatible. */

const desktop = [
  {browser: 'Chrome', os: 'OS X', os_version: 'High Sierra'}, // NOTE initially ok
  {browser: 'Safari', os: 'OS X', os_version: 'High Sierra'}, // NOTE initially ok, with exception of stack trace being bogus in Web Driver mode, and skipping frames in general
  {browser: 'Firefox', os: 'OS X', os_version: 'High Sierra'}, // NOTE initially ok, with `--async-polling false`
  {browser: 'Chrome', os: 'Windows', os_version: '10'}, // NOTE initially ok
  {browser: 'Edge', os: 'Windows', os_version: '10'}, // NOTE initially ok, with exception of contract function name (test workaround)
  {browser: 'Firefox', os: 'Windows', os_version: '10'} // NOTE initially ok, with `--async-polling false`
]
  .map(d => ({
    name: `${d.browser} - ${d.os}`,
    capabilities: Object.assign(d, capabilitiesBase, {os_version: osVersion[d.os]})
  }))
const mobile = [
  'Samsung Galaxy S9', // NOTE initially ok
  'Samsung Galaxy Note 4', // NOTE initially ok
  'iPhone X', // NOTE initially ok, with exception of stack trace being bogus in Web Driver mode, and skipping frames in general
  'iPad Pro' // NOTE initially ok, with exception of stack trace being bogus in Web Driver mode, and skipping frames in general
].map(m => (
  {
    name: m,
    capabilities: Object.assign(
      {
        device: m,
        real_mobile: true
      },
      capabilitiesBase
    )
  }
))

const definitions = desktop.concat(mobile)
console.log(`${definitions.length}:`, definitions.map(d => d.name).join(', '))

module.exports = {
  hostname: "hub-cloud.browserstack.com",
  port: 80,
  browsers: definitions
}