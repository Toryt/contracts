/* Intended to be called with `--async-polling true`. Firefox does not support async polling. */

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
  {browser: 'Chrome', os: 'Windows'}, // NOTE initially ok
  {browser: 'Edge', os: 'Windows'}, // NOTE initially ok, with exception of contract function name (test workaround)
  {browser: 'Safari', os: 'OS X'} // NOTE initially ok, with exception of stack trace being bogus in Web Driver mode, and skipping frames in general
]
  .map(d => ({
    name: `${d.browser} - ${d.os}`,
    capabilities: Object.assign(d, capabilitiesBase, {os_version: osVersion[d.os]})
  }))

const mobile = [
  'Samsung Galaxy S9' // NOTE initially ok
]
  .map(m => ({
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
  hostname: "hub-cloud.browserstack.com",
  port: 80,
  timeout: 20000,
  browsers: definitions
}
