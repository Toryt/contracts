Test-by-contract. Pre- and postcondition verification for Javascript.


Tested
------

* with Mocha,
  * on Mac, with
    * node v6.9.5
    * Chrome Version 57.0.2987.110 (64-bit)
    * Firefox 52.0.2 (64-bit)
    * Safari Version 10.1 (12603.1.30.0.34)
* with Intern
  * on Mac, with
    * node v6.9.5
    * Chrome Version 57.0.2987.110 (64-bit)
    * Firefox 52.0.2 (64-bit)
    * Safari Version 10.1 (12603.1.30.0.34)
  * on Linux, with
    * node v6.10.1
    * node v7.7.4

The web, nor node, are ready for ES6 modules at 2017-03-06.
So, we will still use [UMD].


Versions
--------

* I
  * I/1.0  : First release, minimally functional, Mac - node
  * I/2.0  : Use it in web projects, Mac
  * I/2.1  : Use it with node on linux (Travis)
  * I/2.2  : Now also tests with Intern on node, on Mac and Linux.
             Intern is preferred over Mocha. This version only changes private code,
             test code, and build setup.
  * I/2.3  : Cleanup, renaming, administration, license, fixing warnings
  * I/2.4  : Now also tests with Intern on Mac on Chrome, Safari, 
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
  * III/4.0: test support intern
  

  
  
[UMD]: http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
