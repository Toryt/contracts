/*
 Copyright 2017 - 2017 by Jan Dockx

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

// Learn more about configuring this file at <https://theintern.github.io/intern/#configuration>.
// These default settings work OK for most people. The options that *must* be changed below are the packages, suites,
// excludeInstrumentation, and (if you want functional tests) functionalSuites
define({ // jshint ignore:line
	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// <https://theintern.github.io/intern/#option-capabilities> for links to the different capabilities options for
	// different services.
	//
	// Note that the `build` capability will be filled in with the current commit ID or build tag from the CI
	// environment automatically

  // the command is:
  // > node_modules/.bin/intern-runner config=test/intern > intern-output.txt 2>&1

  // TODO on the Firefox "script too slow" issue: https://github.com/theintern/intern/issues/477

	capabilities: {
    project: "Toryt contracts",
    build: "development",
		//"browserstack.selenium_version": "3.3.1",
    "browserstack.video": false,
    "browserstack.ie.noFlash": true,
    "browserstack.debug": false
	},

	// Browsers to run integration testing against. Options that will be permutated are browserName, version, platform,
	// and platformVersion; any other capabilities options specified for an environment will be copied as-is. Note that
	// browser and platform names, and version number formats, may differ between cloud testing systems.
	environments: [
    {browserName: "firefox", "browser_version": "Firefox 53.0 beta", os: "WINDOWS", os_version: 10}
    // works, after syntax feedback from Ujwal Pathak@Browserstack.
    // Takes a long time, but we do not get a timeout like with FF52. As a consequence, my free minutes are up,
    // but nobody is complaining. I don't know what that means.
    // Should retry with debugging, so I can follow what's happening. Wait for response on Open Source Project
    // account, and try again after vacation.
    /* Closing down for the week. The session has ended after 2 hours, after a sort of ping every minute:
    …
     119:22 0 Get URL⇒http://localhost:9000/__intern/client.html?config=test%2Fintern&basePath=%2F&initialBaseUrl=%2F&reporters=%7B%22id%22%3A%22WebDriver%22%7D&rootSuiteName=firefox%20on%20any%20platform%20-%20unit%20tests&sessionId=32f77f19d981788fb246b9e39a684eea31ebe6bc
     120:22 0 Get URL⇒http://localhost:9000/__intern/client.html?config=test%2Fintern&basePath=%2F&initialBaseUrl=%2F&reporters=%7B%22id%22%3A%22WebDriver%22%7D&rootSuiteName=firefox%20on%20any%20platform%20-%20unit%20tests&sessionId=32f77f19d981788fb246b9e39a684eea31ebe6bc
     121:20 0 Get URL⇒http://localhost:9000/__intern/client.html?config=test%2Fintern&basePath=%2F&initialBaseUrl=%2F&reporters=%7B%22id%22%3A%22WebDriver%22%7D&rootSuiteName=firefox%20on%20any%20platform%20-%20unit%20tests&sessionId=32f77f19d981788fb246b9e39a684eea31ebe6bc
     122:26 0 STOP SESSION
     SESSION LIMIT REACHED
     */
    //{browserName: "chrome", version: "57..latest", platform: ["WINDOWS", "WIN8"]} // OK
    //{browserName: "firefox", version: "52", os: "WINDOWS", os_version: 10}, // "..latest" doesn't work -- browserstack thinks latest is 28
    /* MUDO Fails
     Timeout (Session timed out because the browser was idle for 90 seconds)
     */

    //{browserName: "edge", version: "14..latest", os: "WINDOWS", os_version: 10},
    /* MUDO
    Fails:

     Error: Determined from an Error stack line that the current platform is not supported. at http://localhost:9000/src/_private/util.js:510:13
     at Anonymous function  <__intern/lib/executors/PreExecutor.js:357:6>
     at dispatcher  <__intern/browser_modules/dojo/aspect.js:66:21>[0m

     Yet another stack format (as I was afraid).
     */
    //{browserName: "internet explorer", version: "11", os: "WINDOWS", os_version: 10},
    /* MUDO
    Fails:
     Error: Could not determine EOL for this platform. It is not Windows \r\n, nor Unix \n.
     at Anonymous function  </Users/jand/Scratchpad/toryt/contracts/src/_private/util.js:103:4>
     at execModule  <__intern/browser_modules/dojo/loader.js:332:13>
     at Anonymous function  <__intern/browser_modules/dojo/loader.js:320:21>
     at execModule  <__intern/browser_modules/dojo/loader.js:318:13>
     at Anonymous function  <__intern/browser_modules/dojo/loader.js:320:21>
     at execModule  <__intern/browser_modules/dojo/loader.js:318:13>
     at Anonymous function  <__intern/browser_modules/dojo/loader.js:320:21>
     at execModule  <__intern/browser_modules/dojo/loader.js:318:13>
     at Anonymous function  <__intern/browser_modules/dojo/loader.js:320:21>
     at execModule  <__intern/browser_modules/dojo/loader.js:318:13>[0m
     */
    //{browserName: "iPad", device: "iPad Pro"},
    //{browserName: "iPhone", device: "iPhone 6S Plus"},
    /* MUDO
      Both fail:
     Error: TypeError: Attempting to define property on object that is not extensible. at http://localhost:9000/src/I/ConditionMetaError.js:68:26
     at <__intern/lib/executors/PreExecutor.js:357:32>
     at dispatcher  <__intern/browser_modules/dojo/aspect.js:66:47>[0m
     */
    //{browserName: "android"} // Could not find device: Galaxy Tab 4 10.1, Nexus 5 not found
    // like this, running on Google Nexus 5; takes ages; time to call it a day

    //{browserName: "safari", version: "10..latest", platform: ["MAC"]},
    //{browserName: "edge", version: "14..latest", platform: ["WIN10"]},
    //{browserName: "internet explorer", version: "11..latest", platform: ["WINDOWS", "WIN8"]}
  ],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 2,

	// Name of the tunnel class to use for WebDriver tests.
	// See <https://theintern.github.io/intern/#option-tunnel> for built-in options
	tunnel: "BrowserStackTunnel",

	// Configuration options for the module loader; any AMD configuration options supported by the AMD loader in use
	// can be used here.
	// If you want to use a different loader than the default loader, see
	// <https://theintern.github.io/intern/#option-useLoader> for more information.
	loaderOptions: {
    packages: [
      {name: "𝕋合同", location: "src"},
      {name: "test", location: "test"}
    ],
    paths: {
      "just.randomstring": "bower_components/just.randomstring/just.randomstring"
    },
    map: {
      test: {
        "test/_util/describe": "test/_util/intern/describe",
        "test/_util/it": "test/_util/intern/it",
        "test/_util/expect": "test/_util/intern/expect"
      }
    }
	},

  //reporters: [
  //  {id: "test/_util/intern/PrettyNoSuccess", showProgress: false}
  //],

	// Unit test suite(s) to run in each browser
  suites: ["test/suite"],

	// Functional test suite(s) to execute against each browser once unit tests are completed
	functionalSuites: [],

	// A regular expression matching URLs to files that should not be included in code coverage analysis. Set to `true`
	// to completely disable code coverage.
	excludeInstrumentation: /^(?:test|node_modules|bower_components)\//
});
