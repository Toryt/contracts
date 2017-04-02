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

	capabilities: {
    project: "Toryt contracts",
    build: "development",
		//"browserstack.selenium_version": "3.3.1",
    "browserstack.video": false,
    "browserstack.ie.noFlash": true
	},

	// Browsers to run integration testing against. Options that will be permutated are browserName, version, platform,
	// and platformVersion; any other capabilities options specified for an environment will be copied as-is. Note that
	// browser and platform names, and version number formats, may differ between cloud testing systems.
	environments: [
    //{browserName: "firefox", version: "53 Beta", platform: "WIN8"} works, but we get the "wait" button, which we can't click …
    {browserName: "chrome", version: "57..latest", platform: "WIN8"}
    //{browserName: "chrome", version: "57..latest", platform: ["WINDOWS", "WIN8", "MAC"]},
    //{browserName: "firefox", version: "52..latest", platform: ["WINDOWS", "WIN8", "MAC"]},
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
  //
	// Unit test suite(s) to run in each browser
  suites: ["test/suite"],

	// Functional test suite(s) to execute against each browser once unit tests are completed
	functionalSuites: [],

	// A regular expression matching URLs to files that should not be included in code coverage analysis. Set to `true`
	// to completely disable code coverage.
	excludeInstrumentation: /^(?:test|node_modules|bower_components)\//
});
