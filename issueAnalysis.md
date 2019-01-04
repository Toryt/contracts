Since Safari 12 (the default on Mojave), we now get

    POST /wd/hub/session/37637d38c9bda442465f1e454894638aca029384/execute
    Unexpected HTTP status: 404 Not Found
    […]
    Response Message:
       POST /session/37637d38c9bda442465f1e454894638aca029384/execute did not match a known command

We get the same problem with Firefox since Travis/654 d.d. 2018-12-29. Firefox 64 is being used since Travis/651 (and
worked once without the problem).

The logs say that both the last working and the first failing run use

* browserstack.geckodriver: 0.21.0,
* browserstack.selenium.jar.version: 3.11.0

So, there was no switch there either.

In the Selenium logs, there is a difference in the first line. The logs for Windows / Firefox 64 of Travis/651 say

    INFO [ActiveSessionFactory.apply] - Capabilities are: Capabilities {64bit: true, acceptSslCert: false, acceptSslCerts: false, browser: firefox, browserName: firefox, browser_version: 64.0, browserstack.appiumLogs: false, browserstack.console: ALL, browserstack.debug: false, browserstack.geckodriver: 0.21.0, browserstack.ie.noFlash: false, browserstack.key: <>, browserstack.selenium.jar.version: 3.11.0, browserstack.seleniumLogs: true, browserstack.user: <>, browserstack.video: true, browserstack.video.disableWaterMark: false, firefox_binary: c:\Program Files (x86)\fire..., firefox_profile: UEsDBBQAAAAIADNwWUmK7I+M9AM..., javascriptEnabled: true, moz:firefoxOptions: {args: [-start-debugger-server, 9222], prefs: {devtools.chrome.enabled: true, devtools.debugger.prompt-connection: false, devtools.debugger.remote-enabled: true}}, orig_os: win10, os: Windows, os_version: 10, proxy_type: node, version: 64.0}

Note:

    browser: firefox,
    browserName: firefox,
    browser_version: 64.0,
    …
    browserstack.console: ALL,
    …
    browserstack.accessKey: <>,
    browserstack.user: <>,
    …
    os_version: 10

The logs Travis/654 say

    INFO [ActiveSessionFactory.apply] - Capabilities are: Capabilities {64bit: true, acceptSslCert: false, acceptSslCerts: false, browser: firefox, browserName: firefox, browser_name: Firefox, browser_version: 64.0, browserstack.accessKey: <>, browserstack.appiumLogs: false, browserstack.console: ALL, browserstack.consoleLogs: verbose, browserstack.debug: false, browserstack.geckodriver: 0.21.0, browserstack.ie.noFlash: false, browserstack.key: <>, browserstack.selenium.jar.version: 3.11.0, browserstack.seleniumLogs: true, browserstack.user: <>, browserstack.userName: <>, browserstack.video: true, browserstack.video.disableWaterMark: false, buildName: travis/00654, firefox_binary: c:\Program Files (x86)\fire..., firefox_profile: UEsDBBQAAAAIADNwWUmK7I+M9AM..., javascriptEnabled: true, moz:firefoxOptions: {args: [-start-debugger-server, 9222], prefs: {devtools.chrome.enabled: true, devtools.debugger.prompt-connection: false, devtools.debugger.remote-enabled: true}}, orig_os: win10, os: Windows, osVersion: 10, os_version: 10, projectName: Toryt contracts, proxy_type: node, version: 64.0}

Note:

    browser: firefox,
    browserName: firefox,
    browser_name: Firefox,
    browser_version: 64.0,
    …
    browserstack.console: ALL,
    browserstack.consoleLogs: verbose,
    …
    browserstack.accessKey: <>,
    browserstack.key: <>,
    browserstack.user: <>,
    browserstack.userName: <>,
    …
    buildName: travis/00654,
    …
    osVersion: 10,
    os_version: 10,
    projectName: Toryt contracts,

`browser_name`, `browserstack.consoleLogs`, `browserstack.key`, `browserstack.userName`, `buildName`, `osVersion` and
`projectName` are added.
