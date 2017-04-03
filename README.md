Test-by-contract. Pre- and postcondition verification for Javascript.

The web, nor node, are ready for ES6 modules at 2017-03-06.
So, we will still use [UMD].

Tested
------

* with Mocha,
  * on Mac, with
    * node v6.9.5
    * Chrome Version 57.0.2987.110 (64-bit)
    * Firefox 52.0.2 (64-bit)
    * Safari Version 10.1 (12603.1.30.0.34)
* with [Intern] ![Intern logo]
  * on Mac, with
    * node v6.9.5
    * Chrome Version 57.0.2987.110 (64-bit)
    * Firefox 52.0.2 (64-bit)
    * Safari Version 10.1 (12603.1.30.0.34)
  * on Linux, with
    * node v6.10.1
    * node v7.7.4
  * on Windows 8 and 10 (with [Browserstack])
    * Chrome Version 57

Currently, [Intern] is the major testing framework, intended to test the code itself.
The Mocha tests are there because, when we get to test-by-contract, we want to make sure that both [Intern] and
Mocha are supported.


Status
------

 ![Intern logo] ![Browserstack logo]

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
  * I/1.0  : First release, minimally functional, Mac - node
  * I/2.0  : Use it in web projects, Mac
  * I/2.1  : Use it with node on linux ([Travis])
  * I/2.2  : Now also tests with [Intern] on node, on Mac and Linux.
             [Intern] is preferred over Mocha. This version only changes private code,
             test code, and build setup.
  * I/2.3  : Cleanup, renaming, administration, license, fixing warnings
  * I/2.4  : Now also tests with [Intern] on Mac on Chrome, Safari, 
             Firefox (3 failures, waiting for april version 53)
  * I/2.5  : Fix in behavior and test of util.browserModuleLocation



TODO
----

* I
  * I/3.0  : Windows
  * I/4.0  : Documentation en README
  * I/5.0  : npm, bower
  * I/6.0  : jsdoc
* II
  * II/1.0 : conditions-per-argument
  * II/2.0 : old-support
  * II/3.0 : type conditions
  * II/4.0 : chai-like conditions
* III
  * III/1.0: Specialization / generalization
  * III/2.0: support for type definitions ("classes")
  * III/3.0: test support Mocha
  * III/4.0: test support [Intern]
  

  
  
[UMD]: http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
[Travis]: https://travis-ci.org
[intern issue 447]: https://github.com/theintern/intern/issues/477
[Intern]: https://theintern.github.io
[Browserstack]: https://www.browserstack.com/
[supported by Intern]: https://theintern.github.io/intern/#hosted-selenium
[Browserstack logo]: https://www.browserstack.com/images/mail/browserstack-logo-footer.png
[BrowserStack Status]: https://www.browserstack.com/automate/badge.svg?badge_key=aEZaaFphdUw4L0p1Wk1RZHRhdGk5OEFlYmlsVlVtWDgwb2JTT1R2WnRBST0tLWVaamdQdWszYzFwbXNad2Mrd1JuaFE9PQ==--02f4bb9220a2c3ad513a12c26c9a45345584f230
[Intern logo]: data:image/png;base64,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
