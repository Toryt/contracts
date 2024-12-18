# contracts-v

[![npm version](http://img.shields.io/npm/v/@toryt/contracts-v.svg?style=flat)](https://npmjs.org/package/@toryt/contracts-v 'View this project on npm')
![license](https://img.shields.io/npm/l/@toryt/contracts-v)
![node-lts](https://img.shields.io/node/v-lts/@toryt/contracts-v)
![npm](https://img.shields.io/npm/dt/@toryt/contracts-v) ![dependencies](https://img.shields.io/david/Toryt/contracts)
![development dependencies](https://img.shields.io/david/dev/Toryt/contracts)
![Snyk Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@toryt/contracts-v)
![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/toryt/contracts)
![Codecov](https://img.shields.io/codecov/c/bitbucket/toryt/contracts)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@toryt/contracts-v)
[![Bitbucket open issues](https://img.shields.io/bitbucket/issues/toryt/contracts)](https://bitbucket.org/toryt/contracts/issues)
[![Bitbucket open pull requests](https://img.shields.io/bitbucket/pr/toryt/contracts)](https://bitbucket.org/toryt/contracts/pull-requests/)
![npm collaborators](https://img.shields.io/npm/collaborators/@toryt/contracts-v)
![contributors](https://img.shields.io/github/contributors/Toryt/contracts)
![language count](https://img.shields.io/github/languages/count/toryt/contracts)
![top language](https://img.shields.io/github/languages/top/Toryt/contracts)
![commit activity](https://img.shields.io/github/commit-activity/y/Toryt/contracts)
![last commit](https://img.shields.io/github/last-commit/Toryt/contracts)

Test-by-contract. Pre- and postcondition verification for Javascript.

Works in [node.js](https://nodejs.org/) out-of-the-box.

Use in modern browsers is supported via `browserify`. Run

    > npm run browserify

to create a browser distribution.

## Install

    > npm install --save @toryt/contracts-v

## Tested

- Node 10, 12, 14
- Browsers **unclear — `mochify` is no longer maintained, and has security issues in its dependencies; this needs to be
  reworked**
  - macOS 10.15
    - Safari
    - Chrome
    - Edge
    - Firefox
  - Windows 10
    - Chrome
    - Edge
    - Firefox
  - iOS 11, 12, 13
  - Android 6, 8, 9, 10

[![Browserstack logo](https://www.browserstack.com/images/mail/browserstack-logo-footer.png)](https://www.browserstack.com/)

## Versions

- I
  - I/1.0 : First release, minimally functional, Mac / Node
  - I/2.0 : Use it in web-projects, Mac
  - I/2.1 : Use it with Node on linux ([Travis])
  - I/2.2 : Now also tests with [Intern] on Node, on Mac and Linux. [Intern] is preferred over Mocha. This version only
    changes private code, test code, and build setup.
  - I/2.3 : Cleanup, renaming, administration, license, fixing warnings
  - I/2.4 : Now also tests with [Intern] on Mac on Chrome, Safari, Firefox (3 failures, waiting for april version 53)
  - I/2.5 : Fix in behavior and test of util.browserModuleLocation
  - I/1.2.5 : Relax a test to support use of '(<anonymous)' in Node 8.4; change to semver
- II
  - II/1.0 : First release on npm. The code is functional on Node, and there is no need to wait for browser validation
    to start using it on Node.
  - II/1.1 : Use scope in package name
  - II/1.2 : Cosmetic changes
  - II/2.1.3 : Relax a test to support use of '(<anonymous)' in Node 8.4; change to semver
- III
  - III/3.0.0 : Now also supports contracts for (classic) constructors. In general, the prototype of an implementation
    is “forwarded” to the contract function. The ECMAScript2015 “class” construct is not yet supported (a “class”
    generated constructor cannot be `call`ed or `apply`ed). This is an incompatible change, since we now require more of
    a general contract function. Also, from now on, we will use versioning differently. Since npm insists on semantic
    versioning, the major version number will be the arabic numeral of the roman mark version. We now use `yarn`, but
    that is optional.
  - III/3.0.1 : Relax a test to support use of '(<anonymous)' in Node 8.4
  - III/3.1.0 : Works on Windows (Node 8 and Chrome tested)
  - III/3.1.1 : Update dependencies
- IV
  - IV/4.0.0:
    - CI is realised completely, with automated tests for LTS Node versions and all major browsers on all major
      platforms. We no longer use Bitbucket or Bitbucket Pipelines. Everything is done with GitHub, [travis], and
      [browserstack].
    - dropped direct support for older JS and browsers — now geared toward Node 6 and higher; use `browserify` to
      support browsers
    - fixed display name
    - support arrow functions
    - By default, only preconditions are tested. Postcondition testing must be enabled, for all contracts, a particular
      contract, or 1 implementation, by setting `contract.verifyPostconditions = true`. All testing can be disabled by
      setting `contract.verify = false`.
    - Support `Promise` and `async` functions through `PromiseContract` (with `Contract.Promise` as alias)
  - IV/4.0.1:
    - fix issue with stack trace of condition errors in Chrome ≥ v73
  - IV/4.0.2:
    - fix bug with circular structures in this (and other arguments) with `util.inspect` (It actually turns out there
      are 2 separate, separate bugs in IntelliJ and mocha-reporter)
  - IV/4.0.3:
    - fix bug in determination of Contract Violation location on Windows. It turns out that Node (8, at least) in
      Windows uses \n as EOL in stack traces, and not os.EOL.
  - IV/4.0.4:
    - replace `must` with `should` in tests
  - IV/4.0.5:
    - fix missing EOLs — these where lost in the 4.0.4 rebase
  - IV/4.0.6:
    - test also on Node 12 and 13 (use 12 as dev env)
    - upgrade dependencies (dev)
    - fix test issue with async functions in Node 12 (a similar issue as with 4.0.1) (there is still a test issue with
      Node 12 and later when running tests in IntelliJ)
  - IV/4.0.7:
    - fix test issue with Node 12 and later when running tests in IntelliJ
  - IV/4.0.8:
    - fix bug in `isImplementedBy`: `cf.contract.isImplementedBy(cf)` did not work
  - IV/4.1.0:
    - support Symbols as arguments
    - contract function `name` is now a true property, with the same settings as the implementation function name, and
      no longer a derived property (in response to https://github.com/sinonjs/sinon/issues/2203)
  - IV/4.1.1:
    - ignore unnecessary files in distribution
  - IV/4.1.2:
    - fix bug in dealing with `arguments`, when they contain a Symbol
- V
  - V/5.0.0
    - stop support for Node 8
    - move from Travis to Bitbucket
    - changed package name from `@toryt/contracts-iv` to `@toryt/contracts-v`; you can use different major versions next
      to each other
    - changed the layout of `lib/`: there is no more mark version directory
    - added package export `lib/index` file: you can now import with, e.g.,
      `const { Contract } = required('@toryt/contracts-v')`, in environments that support that syntax
    - the use of `Contract` properties to access other modules is now deprecated; please start using the package export
    - upgraded dependencies
    - to upgrade:
      - `/require('@toryt\/contracts-iv')\.(.*)/require('@toryt/contracts-v').$1/`
      - `/require('@toryt\/contracts-iv')/require('@toryt/contracts-v').Contract/`
      - `/require('@toryt\/contracts-iv\/lib\/IV\/(.*)')/require('@toryt/contracts-v').$1/`

## Where to find

### Repo, CI, issues, pull requests

This project is maintained in [Bitbucket](https://bitbucket.org/toryt/contracts) (repo, CI, issues, pull requests, …).

Branches are copied automatically to [GitHub](https://github.com/Toryt/contracts) by CI. This is done as backup, and
because open source projects are more easily found there. Issues and pull requests there will not be reviewed.

### npm

[@toryt/contracts-v](https://www.npmjs.com/package/@toryt/contracts-v)

## Browsers

Some workarounds were made to accommodate different behavior in Safari. This only concerns using `Error` stack traces to
report where a contract has failed.

Safari support for traces is bad. First of all, Safari haphazardly skips frames in its stack trace. Second, there is a
difference in the stack traces generated when using Safari 'live', and via Web Driver. In the latter case, no lines or
columns are reported, and the stack contains a lot of empty lines. As a result, _it is impossible to return a sensible
location of contract failure consistently with Safari_. A best effort will need to suffice.

Furthermore, Safari on iOS is very weird in adding a default `prototype` object to a non-arrow function. That should
always be there, but experience shows it is sometimes 'late'. It seems to be added 'lazily'.

Environment detection is used in tests to exclude some conditions in some environments.

More extensive, and sadly fragile, browser detection is used in tests for Safari.

## TODO

- V
  - 5.1.0: jsdoc or d.ts
  - 5.1.1: Documentation
  - 5.2.0: extend function contracts - specialization / generalization
  - 5.3.0: type conditions ('interfaces')
  - 5.4.0: support `class`
- VI
  - 6.0.0: change to Joi-like conditions (conditions-per-argument)
  - 6.1.0: old-support
  - 6.2.0: test support Mocha
