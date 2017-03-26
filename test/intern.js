// Learn more about configuring this file at <https://theintern.github.io/intern/#configuration>.
// These default settings work OK for most people. The options that *must* be changed below are the packages, suites,
// excludeInstrumentation, and (if you want functional tests) functionalSuites
define({
	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// <https://theintern.github.io/intern/#option-capabilities> for links to the different capabilities options for
	// different services.
	//
	// Note that the `build` capability will be filled in with the current commit ID or build tag from the CI
	// environment automatically
	capabilities: {
		'browserstack.selenium_version': '2.45.0'
	},

	// Browsers to run integration testing against. Options that will be permutated are browserName, version, platform,
	// and platformVersion; any other capabilities options specified for an environment will be copied as-is. Note that
	// browser and platform names, and version number formats, may differ between cloud testing systems.
	environments: [
		{ browserName: 'internet explorer', platform: 'WINDOWS' },
		{ browserName: 'firefox', platform: [ 'WINDOWS', 'MAC' ] },
		{ browserName: 'chrome', platform: [ 'WINDOWS', 'MAC' ] },
		{ browserName: 'safari', platform: 'MAC' }
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 2,

	// Name of the tunnel class to use for WebDriver tests.
	// See <https://theintern.github.io/intern/#option-tunnel> for built-in options
	tunnel: 'BrowserStackTunnel',

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

  reporters: [
    {id: "test/_util/intern/PrettyNoSuccess"}
  ],

	// Unit test suite(s) to run in each browser
  suites: ["test/js/mochaTests", "test/_private/mochaTests", "test/I/mochaTests"],

	// Functional test suite(s) to execute against each browser once unit tests are completed
	functionalSuites: [],

	// A regular expression matching URLs to files that should not be included in code coverage analysis. Set to `true`
	// to completely disable code coverage.
	excludeInstrumentation: /^(?:test|node_modules|bower_components)\//
});
