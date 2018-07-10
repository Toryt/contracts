const webdriver = require('selenium-webdriver')

function getCredentials () {
  const user = process.env.BROWSERSTACK_USER
  const key = process.env.BROWSERSTACK_KEY
  console.log(`using user '${user}' - key '${key}'`)
  return {user, key}
}

async function test () {
  const credentials = getCredentials()

  // Input capabilities
  // noinspection SpellCheckingInspection
  const capabilities = {
    'browserName': 'Chrome',
    'browser_version': '67.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1024x768',
    'browserstack.user': credentials.user,
    'browserstack.key': credentials.key
  }

  const driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build()

  await driver.get('http://www.google.com')
  await driver
    .findElement(webdriver.By.name('q'))
    .sendKeys('BrowserStack\n')
  const title = await driver.getTitle()
  console.log(title)
  // noinspection JSIgnoredPromiseFromCall
  driver.quit()
  console.log('Done')
}

// noinspection JSIgnoredPromiseFromCall
test()
