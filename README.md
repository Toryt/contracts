# Test-by-contract. Pre- and postcondition verification for Javascript.

[![Build Status](https://travis-ci.org/Toryt/contracts.svg?branch=master)](https://travis-ci.org/Toryt/contracts)
[![codecov](https://codecov.io/gh/Toryt/contracts/branch/master/graph/badge.svg)](https://codecov.io/gh/Toryt/contracts)
[![npm version](http://img.shields.io/npm/v/@toryt/contracts-iv.svg?style=flat)](https://npmjs.org/package/@toryt/contracts-iv 'View this project on npm')
![semver stability](https://img.shields.io/dependabot/semver/Toryt/contracts-iv.svg)
![downloads](https://img.shields.io/npm/dt/@toryt/contracts-iv.svg)
![dependencies](https://img.shields.io/david/Toryt/contracts.svg)
![development dependencies](https://img.shields.io/david/dev/Toryt/contracts.svg)
[![issues](https://img.shields.io/github/issues/Toryt/contracts.svg)](https://github.com/Toryt/contracts/issues)
[![pull requests](https://img.shields.io/github/issues-pr-closed/Toryt/contracts.svg)](https://github.com/Toryt/contracts/pulls)
![contributors](https://img.shields.io/github/contributors/Toryt/contracts.svg)
![last commit](https://img.shields.io/github/last-commit/Toryt/contracts.svg)
![commit activity](https://img.shields.io/github/commit-activity/y/Toryt/contracts.svg)
![# languages](https://img.shields.io/github/languages/count/Toryt/contracts.svg)
![top language](https://img.shields.io/github/languages/top/Toryt/contracts.svg)

The web, nor node, are ready for ES6 modules at 2017-03-06.

This code is written for Nodejs. Browsers use is supported via `browserify`. Run

    > npm run browserify

to create a browser distribution.

## Tested

- on Mac, during development, with Node 8
- on Linux, with, via [Travis] ![Build Status](https://travis-ci.org/Toryt/contracts.svg?branch=master)
  (https://travis-ci.org/Toryt/contracts), with
  - Node 8
  - Node 10
  - Node 12
- on browsers, with [Browserstack] ![Browserstack logo] and `mochify`,
  - on the 'latest' versions of Chrome, Firefox, Safari, and Edge, on
    - Windows 10
    - macOS High Sierra
  - on the 'latest' versions of the default browser, on
    - the 'latest' version of iOS
    - the 'latest' version of Android

## Browsers

Some workarounds were made to accommodate different Safari. This only concerns using `Error` stack traces to report
where a contract has failed.

Safari support for traces is bad. First of all, Safari haphazardly skips frames in its stack trace. Second, there is a
difference in the stack traces generated when using Safari 'live', and via Web Driver. In the latter case, no lines or
columns are reported, and the stack contains a lot of empty lines. As a result, _it is impossible to return a sensible
location of contract failure consistently with Safari_. A best effort will need to suffice.

Furthermore, Safari on iOS is very weird in adding a default `prototype` object to a non-arrow function. That should
always be there, but experience shows it is sometimes 'late'. It seems to be added 'lazily'.

Environment detection is used in tests to exclude some conditions in some environments.

More extensive, and sadly fragile, browser detection is used in tests for Safari.

## Versions

- I
  - I/1.0 : First release, minimally functional, Mac - node
  - I/2.0 : Use it in web projects, Mac
  - I/2.1 : Use it with node on linux ([Travis])
  - I/2.2 : Now also tests with [Intern] on node, on Mac and Linux. [Intern] is preferred over Mocha. This version only
    changes private code, test code, and build setup.
  - I/2.3 : Cleanup, renaming, administration, license, fixing warnings
  - I/2.4 : Now also tests with [Intern] on Mac on Chrome, Safari, Firefox (3 failures, waiting for april version 53)
  - I/2.5 : Fix in behavior and test of util.browserModuleLocation
  - I/1.2.5 : Relax a test to support use of '(<anonymous)' in node 8.4; change to semver
- II
  - II/1.0 : First release on npm. The code is functional on node, and there is no need to wait for browser validation
    to start using it on node.
  - II/1.1 : Use scope in package name
  - II/1.2 : Cosmetic changes
  - II/2.1.3 : Relax a test to support use of '(<anonymous)' in node 8.4; change to semver
- III
  - III/3.0.0 : Now also supports contracts for (classic) constructors. In general, the prototype of an implementation
    is "forwarded" to the contract function. The ECMAScript2015 "class" construct is not yet supported (a "class"
    generated constructor cannot be `call`ed or `apply`ed). This is an incompatible change, since we now require more of
    a general contract function. Also, from now on, we will use versioning differently. Since npm insists on semantic
    versioning, the major version number will be the arabic numeral of the roman mark version. We now use `yarn`, but
    that is optional.
  - III/3.0.1 : Relax a test to support use of '(<anonymous)' in node 8.4
  - III/3.1.0 : Works on Windows (node 8 and Chrome tested)
  - III/3.1.1 : Update dependencies
- IV
  - IV/4.0.0:
    - CI is realised completely, with automated tests for LTS Node versions and all major browsers on all major
      platforms. We no longer use Bitbucket or Bitbucket Pipelines. Everything is done with GitHub, [travis], and
      [browserstack]
    - dropped direct support for older JS and browsers - now geared toward Node 6 and higher; use `browserify` to
      support browsers
    - fixed display name
    - support arrow functions
    - By default, only preconditions are tested. Postcondition testing must be enabled, for all contracts, a particular
      contract, or 1 implementation, by setting `contract.verifyPostconditions = true`. All testing can be disabled by
      setting `contract.verify = false`.
    - Support `Promise` and `async` functions through `PromiseContract` (with `Contract.Promise` as alias)
  - IV/4.0.1:
    - fix issue with stack trace of condition errors in Chrome ≥ v73

## TODO

- IV
  - IV/4.0.2: fix bug with circular structures in this (and other arguments) with util.inspect
  - IV/4.0.3: jsdoc
  - IV/4.0.4: Documentation
  - IV/4.1.0: extend function contracts - specialization / generalization
  - IV/4.2.0: type conditions ('interfaces')
  - IV/4.3.0: support `class`
- V
  - V/5.0.0: change to Joi-like conditions (conditions-per-argument)
  - V/5.1.0: old-support
  - V/5.2.0: test support Mocha

[intern]: https://theintern.github.io
[travis]: https://travis-ci.org/Toryt/contracts
[browserstack]: https://www.browserstack.com/
[browserstack logo]: https://www.browserstack.com/images/mail/browserstack-logo-footer.png
[browserstack status]:
  https://www.browserstack.com/automate/badge.svg?badge_key=aEZaaFphdUw4L0p1Wk1RZHRhdGk5OEFlYmlsVlVtWDgwb2JTT1R2WnRBST0tLWVaamdQdWszYzFwbXNad2Mrd1JuaFE9PQ==--02f4bb9220a2c3ad513a12c26c9a45345584f230
