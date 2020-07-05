const bitbucketBuild = process.env.BITBUCKET_BUILD_NUMBER
const travisBuild = process.env.TRAVIS_BUILD_NUMBER
const build = bitbucketBuild
  ? `bitbucket/${bitbucketBuild.padStart(5, '0')}`
  : travisBuild
  ? `travis/${travisBuild.padStart(5, '0')}`
  : `manual ${new Date().toISOString()}`
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
  'OS X': 'Catalina',
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
    name: `${definition.browser} - ${definition.os} ${definition.os_version || osVersion[definition.os]}`,
    capabilities: Object.assign(
      {},
      capabilitiesBase,
      {
        os_version: osVersion[definition.os]
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
