Test-by-contract. Pre- and postcondition verification for Javascript.

The web, nor node, are ready for ES6 modules at 2017-03-06.
So, we will still use [UMD].

Tested
------

* with Mocha,
  * on Mac, with
    * node v6.10.3
    * Chrome Version 59.0.3071.115 (Official Build) (64-bit)
    * Firefox 54.0 (64-bit)
    * Safari Version 10.1.1 (12603.2.4)
      * it needs persuasion: for some reason it fails regularly with a timeout on just.randomstring.js
* with [Intern]
  * on Mac, with
    * node v6.10.3
    * Chrome Version 59.0.3071.115 (Official Build) (64-bit)
      * There is 1 failure for `_private/util.stackOutsideThisLibrary`,
        "only has stack lines outside the library, and the first line refers to this code, for a local error", we don't
        get with Mocha on Chrome, or Firefox with [Intern]
      * _fails with "Cannot find the Node.js require", after first having worked before a new npm install_
    * Firefox 54.0 (64-bit) _fails with "Cannot find the Node.js require",
      * _fails with "Cannot find the Node.js require", after first having worked before a new npm install_
    * Safari Version 10.1.1 (12603.2.4) 
      * _fails with "Cannot find the Node.js require"_
  * on Linux, with, via [Travis] [![Build Status](https://travis-ci.org/Toryt/contracts.svg?branch=master)](https://travis-ci.org/Toryt/contracts)
    * node v6.11.1
    * the latest node version (v8.1.4); you will find builds that are tested ok with node v7.7.4, node v8.0.0, … 
      on [Travis]
  * on Windows 8 and 10 with [Browserstack] ![Browserstack logo] _(not yet tested with version III)_
    * Chrome Version 57

Currently, [Intern] is the major testing framework, intended to test the code itself.
The Mocha tests are there because, when we get to test-by-contract, we want to make sure that both [Intern] and
Mocha are supported.


Status
------

The project is currently experimenting with [Browserstack] and [Intern], to get it running on all modern platforms
(see the `branches experiment/browserstack_#`). 

The current status is

![BrowserStack Status]

* on Windows 8 and Windows 10
  * Chrome 57 is ok
* on Windows 10
  * Firefox 53 (beta) cannot be configured; when requested, Firefox 52 runs. Firefox 53 would clear up the 3 
    remaining errors.
  * Firefox 52 fails with timeout - the script is running too long. The [Intern] documentation mentions something 
    like this. There might be a workaround (see [intern issue 447]).
  * Edge 14 fails. It has yet another stack line format. It should be possible to fix this.
  * Internet Explorer 11 fails. We cannot determine the EOL format. It is not \r\n as expected. This requires more
    research. It is not guaranteed that there would be no other problems after this is solved. If necessary,
    Internet Explorer will not be supported.
* on iOS (iPad Pro and iPhone 6 Plus tested), the tests fail, because the browser says we should not
  define a property on object that is not extensible (`ConditionMetaError.js:68:26`). This property is indeed defined
  frozen on the prototype object's prototype, but this is totally unexpected. We do not get this error anywhere else.
  This means the Safari version on iOS is seriously different from the Safari version on macOS Sierra. Again,
  this will require research to resolve.
* a test on Android (on Google Nexus 5) runs, but was interrupted because it takes very long

Internet Explorer and the mobile environments are not the priority, but Internet Explorer would be nice to have,
and the latest iOS Safari is a must. The Android browser is not very good to start with, and Android users often
use another browser anyway.

Once we get things working with [Browserstack] on Windows 10 for the latest versions of Chrome, Firefox, Edge,
and possibly Internet Explorer, and on the latest version of iOS, and possibly Android, tests will be extended to
go back in versions as much as possible, to see how compatible the code is. If the latest versions to date are
supported, this will be our basis. Code will not be changed to support older versions, but it is interesting to
know how far back we can go.

nodejs testing is now only done for Mac, by hand, and on Linux, by [Travis]. It is necessary to also find a way to
do continuous testing for nodejs on Windows 10 at least. Again, code will not be changed to support older versions, 
but it is interesting to know how far back we can go.
 
When all this is ok, continuous integration should then automatically include new versions of all environments,
and rerun the tests every week, to see if anything breaks while the universe expands.

In that respect, it would be sensibly to also include the latest Chrome Canary and Firefox beta versions in the
test setup. There currently is no clear way how to do that, since [Browserstack] does not offer Chrome Canary, and 
the Firefox beta does not seem to work. There is no comparable setup for Safari, Edge, Firefox, iOS or Android that
I am aware of (except for the developer beta programs, for which there is no support on [Browserstack]).

When we get to test-by-contract, it might be interesting to also include testing with Jasmine, the other important
Javascript testing framework.

In that respect, it might also prove useful to use other browser testing services [supported by Intern] in the future.


Versions
--------

* I
  * I/1.0     : First release, minimally functional, Mac - node
  * I/2.0     : Use it in web projects, Mac
  * I/2.1     : Use it with node on linux ([Travis])
  * I/2.2     : Now also tests with [Intern] on node, on Mac and Linux.
                [Intern] is preferred over Mocha. This version only changes private code,
                test code, and build setup.
  * I/2.3     : Cleanup, renaming, administration, license, fixing warnings
  * I/2.4     : Now also tests with [Intern] on Mac on Chrome, Safari, 
                Firefox (3 failures, waiting for april version 53)
  * I/2.5     : Fix in behavior and test of util.browserModuleLocation
* II
  * II/1.0    : First release on npm. The code is functional on node, and there is no need to wait for browser 
                validation to start using it on node.
* III
  * III/3.0.0 : Now also supports contracts for (classic) constructors. In general, the prototype of an implementation
                is "forwarded" to the contract function. The ECMAScript2015 "class" construct is not yet supported
                (a "class" generated constructor cannot be `call`ed or `apply`ed). This is an incompatible change,
                since we now require more of a general contract function.
                Also, from now on, we will use versioning differently. Since npm insists on semantic versioning,
                the major version number will be the arabic numeral of the roman mark version.
                We now use `yarn`, but that is optional.



TODO
----

The test suite is too unstable, and should be stabilized soon. The coverage is excellent, but in metrics as in
reporting quirks, but the broad range of platforms and their evolution is tiresome.  

* III
  * III/3.1.0  : Select whether to include nothing, pre only, or pre and post at load time, and whether to validate
                 nothing, pre only, or pre and post at runtime.
  * III/3.2.0  : Windows
  * III/3.3.0  : Documentation en README
  * III/3.4.0  : jsdoc
* IV
  * IV/4.0.0 : conditions-per-argument
  * IV/4.1.0 : old-support
  * IV/4.2.0 : type conditions
  * IV/4.3.0 : chai-like conditions
* V
  * V/5.0.0: Specialization / generalization
  * V/5.1.0: support for type definitions ("classes")
  * V/5.2.0: test support Mocha
  * V/5.3.0: test support [Intern]
  

  
  
[UMD]: http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
[Travis]: https://travis-ci.org/Toryt/contracts
[intern issue 447]: https://github.com/theintern/intern/issues/477
[Intern]: https://theintern.github.io
[Browserstack]: https://www.browserstack.com/
[supported by Intern]: https://theintern.github.io/intern/#hosted-selenium
[Browserstack logo]: https://www.browserstack.com/images/mail/browserstack-logo-footer.png
[BrowserStack Status]: https://www.browserstack.com/automate/badge.svg?badge_key=aEZaaFphdUw4L0p1Wk1RZHRhdGk5OEFlYmlsVlVtWDgwb2JTT1R2WnRBST0tLWVaamdQdWszYzFwbXNad2Mrd1JuaFE9PQ==--02f4bb9220a2c3ad513a12c26c9a45345584f230
