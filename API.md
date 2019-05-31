## Classes

<dl>
<dt><a href="#AbstractContract">AbstractContract</a></dt>
<dd></dd>
<dt><a href="#AbstractError">AbstractError</a></dt>
<dd></dd>
<dt><a href="#ConditionError">ConditionError</a></dt>
<dd></dd>
<dt><a href="#ConditionMetaError">ConditionMetaError</a></dt>
<dd></dd>
<dt><a href="#ConditionViolation">ConditionViolation</a></dt>
<dd></dd>
<dt><a href="#Contract">Contract</a></dt>
<dd></dd>
<dt><a href="#ContractError">ContractError</a></dt>
<dd></dd>
<dt><a href="#ExceptionConditionViolation">ExceptionConditionViolation</a></dt>
<dd></dd>
<dt><a href="#PostconditionViolation">PostconditionViolation</a></dt>
<dd></dd>
<dt><a href="#PreconditionViolation">PreconditionViolation</a></dt>
<dd></dd>
<dt><a href="#PromiseContract">PromiseContract</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#mustNotHappen">mustNotHappen</a></dt>
<dd><p>Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
that a function should never throw exceptions, or never end nominally, or should never be called,
because the conditions will always fail.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#falseCondition">falseCondition()</a></dt>
<dd><p>Function that always returns <code>false</code>.</p>
</dd>
<dt><a href="#outcome">outcome()</a></dt>
<dd><p>Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
this is the function call result, respectively, the thrown exception.</p>
</dd>
<dt><a href="#callee">callee()</a></dt>
<dd><p>Returns the last element of an Array-like argument. In post- and exception conditions,
this is the called contract function, bound to this. This can be used in recursive definitions.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#GeneralContractFunction">GeneralContractFunction</a> : <code>function</code></dt>
<dd><p>A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function
given as a parameter is a General Contract Function.</p>
<p>To be a General Contract Function, the subject must</p>
<ul>
  <li>be a function,</li>
  <li>have a frozen `contract` property that refers to a AbstractContract,</li>
  <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
  <li>have a frozen `location` property, that has a value,</li>
  <li>have a frozen `bind` property, which is [bindContractFunction](#AbstractContract.bindContractFunction), and</li>
  <li>have a `name`, which is a string that gives information for a programmer to understand which contract
    function this is, and</li>
  <li>if the `implementation` function has a `prototype`, have a `prototype` property,
    <ul>
      <li>that is an object,</li>
      <li>that has a `constructor` property that is the contract function, and</li>
      <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
    </ul>
  </li></dd>
<dt><a href="#ContractFunction">ContractFunction</a> : <code><a href="#GeneralContractFunction">GeneralContractFunction</a></code></dt>
<dd><p>A Contract Function is an implementation of a Contract. This function verifies whether a function
given as a parameter is a Contract Function.</p>
<p>To be a Contract Function, the subject must</p>
<ul>
  <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
  <li>have a frozen `location` property, which is a string that represents a location in source code,
    outside this library.</li>
</ul></dd>
</dl>

<a name="AbstractContract"></a>

## AbstractContract

**Kind**: global class

- [AbstractContract](#AbstractContract)
  - [new AbstractContract(\_location)](#new_AbstractContract_new)
  - [.internalLocation](#AbstractContract.internalLocation)
  - [.root](#AbstractContract.root)
  - [.bindContractFunction()](#AbstractContract.bindContractFunction)
  - [.isAGeneralContractFunction(f)](#AbstractContract.isAGeneralContractFunction) ⇒ <code>boolean</code>
  - [.isAContractFunction(f)](#AbstractContract.isAContractFunction) ⇒ <code>boolean</code>
  - [.bless(contractFunction, contract, implFunction, location)](#AbstractContract.bless)

<a name="new_AbstractContract_new"></a>

### new AbstractContract(\_location)

Abstract definition of a function contract.

An AbstractContract consists of an array of preconditions, an array of nominal postconditions, and an array of
exceptional postconditions.

The conditions are functions whose result is interpreted as a booleany value. The conditions are called with the same
`this` and arguments as the functional call in which they are verified. When verifying nominal postconditions, the
result of the function call is added as extra argument. When verifying exceptional postconditions, the exception thrown
by the function call is added as extra argument. Finally, a version of the contract function bound to `this` is supplied
as final parameter when verifying nominal and exceptional postconditions. This function reference can be used in
contracts that use recursion. `.outcome`, and `.callee` can be used to extract the result or exception (outcome) or
bound function for recursive definitions inside conditions from `arguments`.

The default preconditions and postconditions are the empty array (anything goes). For exceptions, the default condition
is `AbstractContract.mustNotHappen` (any exception is a violation).

Furthermore, an instance contains a `location` property, which is a line of text that refers to the source code where
the contract was created. For internal contracts, this is `AbstractContract.internalLocation.

If `verify` and `verifyPostconditions` are both truthy, contract function verification will verify preconditions,
postconditions and exception conditions. If `verify` is truthy, but `verifyPostconditions` is falsy, contract function
verification will verify preconditions, but not postconditions and exception conditions. This is the default. If
`verify` is falsy, contract function executions will not be verified.

The `contract` of a contract function is a separate object that has the contract it is an implementation of as a
prototype. Therefor, the `verify` and `verifyPostconditions` properties can be overridden for all `AbstractContracts` by
changing the properties of `AbstractContracts.prototype`, for one contract by changing its properties, or for a
particular contract function `cf` by changing the properties of `cf.contract`. The values the properties hold at the
moment of the call are used (this is relevant for asynchronous functions).

With well-tested code, the default settings should be used in production. When the code is extremely stable, `verify`
can be set to `false` to gain additional speed. In tests, `verify` should be truthy and `verifyPostconditions` should be
`true`, at least for the function under test.

The `_location` argument is for internal use, and might be removed.

| Param      | Type | Description |
| ---------- | ---- | ----------- |
| \_location |      |             |

<a name="AbstractContract.internalLocation"></a>

### AbstractContract.internalLocation

Object to be used as location for contracts and implementations that are generated inside this library.

**Kind**: static property of [<code>AbstractContract</code>](#AbstractContract)  
<a name="AbstractContract.root"></a>

### AbstractContract.root

The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can be
weakened by specializations, and the most general nominal and exceptional postconditions (anything goes), which can be
strengthened by specializations.

**Kind**: static property of [<code>AbstractContract</code>](#AbstractContract)  
<a name="AbstractContract.bindContractFunction"></a>

### AbstractContract.bindContractFunction()

This function is intended to be used as the bind function of contract functions. It makes sure that, when applied to a
contract function, the result [is also a contract function]{@linkplain AbstractContract#isAContractFunction}. The bind
aspect of the functionality is the same as [Function#prototype#bind](Function#prototype#bind). The implementation of the
resulting contract function is also bound in the same way as the resulting contract function itself.

**Kind**: static method of [<code>AbstractContract</code>](#AbstractContract)  
<a name="AbstractContract.isAGeneralContractFunction"></a>

### AbstractContract.isAGeneralContractFunction(f) ⇒ <code>boolean</code>

Verify whether `f` is a [GeneralContractFunction](#GeneralContractFunction)

**Kind**: static method of [<code>AbstractContract</code>](#AbstractContract)

| Param | Type            |
| ----- | --------------- |
| f     | <code>\*</code> |

<a name="AbstractContract.isAContractFunction"></a>

### AbstractContract.isAContractFunction(f) ⇒ <code>boolean</code>

Verify whether `f` is a [ContractFunction](#ContractFunction)

**Kind**: static method of [<code>AbstractContract</code>](#AbstractContract)

| Param | Type            |
| ----- | --------------- |
| f     | <code>\*</code> |

<a name="AbstractContract.bless"></a>

### AbstractContract.bless(contractFunction, contract, implFunction, location)

Helper function that transforms any function given as <code>contractFunction</code> into a [contract
function]{@linkplain AbstractContract#isAContractFunction} for the given parameters. If {@code implFunction.prototype}
exists, the {@code contractFunction.prototype} is changed to an object that refers to {@code contractFunction} as {@code
contractFunction.prototype.constructor}, is otherwise empty, and has {@code implFunction.prototype} as prototype.

**Kind**: static method of [<code>AbstractContract</code>](#AbstractContract)

| Param            | Type                                               | Description                                                                                                                                                          |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contractFunction | <code>function</code>                              | the regular [Function](Function) to be transformed into a contract function                                                                                          |
| contract         | [<code>AbstractContract</code>](#AbstractContract) | the contract `contractFunction` is a realisation of                                                                                                                  |
| implFunction     | <code>function</code>                              | the function that is used in `contractFunction` to realize the postconditions of <code>contract</code> under its preconditions                                       |
| location         | <code>string</code>                                | the location outside this library that the resulting [contract function]{@linkplain AbstractContract#isAContractFunction} will carry, that says where it is defined. |

<a name="AbstractError"></a>

## AbstractError

**Kind**: global class  
<a name="new_AbstractError_new"></a>

### new AbstractError()

Thrown when an abstract method is called. You shouldn't.

<a name="ConditionError"></a>

## ConditionError

**Kind**: global class  
<a name="new_ConditionError_new"></a>

### new ConditionError()

ConditionError is the general supertype of all errors thrown by Toryt Contracts. ConditionError itself is to be
considered abstract.

A ConditionError is a communication to developers, through which Toryt Contracts tries to describe as correctly as
possible what went wrong. The error reports a contract violation, or an error in a contract condition. We assume the
Toryt Contracts code itself will not fail.

In general, we want to report to the developer:

<ul>
  <li>which condition was violated, or has an error, in source code, which implies knowing
    <ul>
      <li>of which contract the condition is a part of</li>
    </ul>
  </li>
  <li>in what circumstances the error occurred, which implies knowing
    <ul>
      <li>where the contract function was called, in source code, which implies knowing
        <ul>
          <li>which function called the contract function, and<li>
        </ul>
      </li>
      <li>which were were the arguments of the call of the contract function, during execution of this
        function call instance, and</li>
      <li>which contract function was called, which implies knowing
        <ul>
          <li>what the contract of the called contract function is, and<li>
          <li>which implementation of the contract was called.<li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

The condition is usually a short and anonymous JavaScript function. We will report the full implementation of the
condition, which might be multi-line.

The contract is an object, and there is no automatic way to assign recognizable names to objects. A contract does
however have a `location` property that stores a line from a stacktrace that, in most JavaScript engines, contains a
reference to where the contract is created in source code.

The actual arguments can easily be listed.

The called contract function is actually 2 functions: the supplied naked implementation, and the doctored contract
function, which embeds the supplied naked implementation in contract verifications.

The latter is the function called from outside. All doctored contract functions are different instances of the same
function definition in source code. It is not informative to communicate about this source code to the developer, yet
its call is what is relevant. A contract function does have a `location` property that stores a line from a stacktrace
that, in most JavaScript engines, contains a reference to where the contract function is created in source code. The
name of the contract function is used in communication. It is based on the implementation.

The naked implementation will often be nameless. Showing the code is less relevant, because it will often be rather
long, but we concise version is used for lack of a better solution when there is no name. There is no way to create a
location reference to the naked implementation. The reference to where the contract function is created in source code
in the contract function `location` property will show the developer which implementation is used. The implementation is
either defined there, or the developer can navigate from there to the implementation definition in a good IDE.

The calling function cannot be retrieved in modern Javascript. ConditionError instances do however create a call stack
through which the developer can determine the calling function.

Instances should be frozen before they are thrown.

<h3>Invariants</h3>
<ul>
  <li>`contractFunction` is a frozen mandatory property, and refers to a contract function</li>
  <li>`condition` is a frozen mandatory property, and refers to a function</li>
  <li>`self` is a frozen property; it can be anything, also `null` or `undefined`</li>
  <li>`args` is a frozen property, and refers to an Array or Arguments instance</li>
  <li>`name` is a mandatory property, and refers to a string</li>
  <li>`message` is a frozen mandatory property, and refers to a string</li>
  <li>`moreDetail` is a mandatory property, and refers to a function</li>
  <li>`stack` is a read-only property, that returns a string, that starts with the instance's
    <code>name</code>>, the string ": ", and <code>message</code>, followed by the [#getDetails()](#getDetails()),
    and by stack code references, that do not contain references to the inner workings of the Toryt
    Contracts library.</li>
</ul>

<a name="ConditionMetaError"></a>

## ConditionMetaError

**Kind**: global class  
<a name="new_ConditionMetaError_new"></a>

### new ConditionMetaError()

The condition could not be evaluated. There is probably a programming error in the condition itself.

error must be optional

- to make it possible to use this as the prototype for more special types
- because in JavaScript, also undefined and null can be thrown Therefor, a ConditionMetaError is also civilized if the
  error is falsy.

<a name="ConditionViolation"></a>

## ConditionViolation

**Kind**: global class  
<a name="new_ConditionViolation_new"></a>

### new ConditionViolation(contractFunction, condition, self, args)

Super type for objects that are thrown to signal a condition violation. This is intended to be abstract.

| Param            | Type                  | Description                                                             |
| ---------------- | --------------------- | ----------------------------------------------------------------------- |
| contractFunction | <code>function</code> | The contract function that reports this violation                       |
| condition        | <code>function</code> | The condition that was violated                                         |
| self             |                       | The <code>this</code> that <code>contractFunction</code> was called on  |
| args             | <code>Array</code>    | The arguments with which the contract function that failed, was called. |

<a name="Contract"></a>

## Contract

**Kind**: global class

- [Contract](#Contract)
  - [new Contract()](#new_Contract_new)
  - [.implementation(implFunction)](#Contract+implementation) ⇒ [<code>ContractFunction</code>](#ContractFunction)

<a name="new_Contract_new"></a>

### new Contract()

The separation between AbstractContract and Contract is necessary to break a dependency cycle with ConditionError.

<a name="Contract+implementation"></a>

### contract.implementation(implFunction) ⇒ [<code>ContractFunction</code>](#ContractFunction)

Return a `ContractFunction` that implements `this` with `implFunction` as its implementation.

The returned `ContractFunction`'s `contract` is a separate object, that has `this` as its immediate prototype.

When called, the returned `ContractFunction` will just execute `implFunction` if is its `contract.verify` property is
falsy.

If is its `contract.verify` property is truthy, it will first verify the preconditions specified in `this`, and call
`implFunction` only if all preconditions pass.

If is its `contract.verifyPostconditions` property is falsy, the returned `ContractFunction` will immediately return the
value `implFunction` returned, or immediately throw the exception `implFunction` threw.

If the returned `ContractFunction`'s `contract.verifyPostconditions` property is truthy, it will verify the
postconditions of `this` with the returned value if `implFunction` ends nominally, and the return that value if all
postconditions pass. If `implFunction` ends exceptionally, the returned `ContractFunction` will verify the exception
conditions of `this` with the thrown exception, and the throw that exception if all exception conditions pass.

**Kind**: instance method of [<code>Contract</code>](#Contract)

| Param        | Type                  |
| ------------ | --------------------- |
| implFunction | <code>function</code> |

<a name="ContractError"></a>

## ContractError

**Kind**: global class  
<a name="new_ContractError_new"></a>

### new ContractError()

ContractError is the general supertype of all errors thrown by Toryt Contracts. ContractError itself is to be considered
abstract.

The main feature of a ContractError is that it provides a safe, cross-platform stack trace. Instances should be frozen
before they are thrown.

<h3>Invariants</h3>
<ul>
  <li>`name` is a mandatory property, and refers to a string</li>
  <li>`message` refers to a string</li>
  <li>`stack` is a read-only property, that returns a string, that starts with the instances `name`, the
    string ": ", and `message`, and is followed by stack code references, that do no contain references
    to the inner workings of the Toryt Contracts library.</li>
</ul>

<a name="ExceptionConditionViolation"></a>

## ExceptionConditionViolation

**Kind**: global class  
<a name="new_ExceptionConditionViolation_new"></a>

### new ExceptionConditionViolation(contractFunction, condition, self, args)

<p>An ExceptionConditionViolation is the means by which Toryt Contracts tells developers that it detected that an
  exception condition was violated when a contract function was called. The implementation of the contract function
  that was called, was executed and threw an exception, but the exception or the resulting state did not
  conform.</p>

<p>If the exception condition itself is correct, this is a programming error on the part of the implementation.
  One should assume the system is now in an undefined state.</p>

<p>The developer wants to know</p>
<ul>
  <li>where the contract function was called in source code,</li>
  <li>what the arguments were of the instance of the call, at the time of the call (old),</li>
  <li>what the result of the call is, and what the state is of all relevant objects is, after the call, and</li>
  <li>which exception condition was violated in source code (which implies knowing which contract it is a
    part of).</li>
</ul>

<p>The state of the relevant objects after the call is a difficult subject, since we should assume the system
  is in an undefined state. Retrieving the state might not be possible, because invariants and preconditions
  will no longer be guaranteed.</p>

| Param            | Type                  | Description                                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| contractFunction | <code>function</code> | The contract function that reports this violation                                                                                                                                                                                                                                                      |
| condition        | <code>function</code> | The condition that was violated                                                                                                                                                                                                                                                                        |
| self             |                       | The <code>this</code> that <code>contractFunction</code> was called on                                                                                                                                                                                                                                 |
| args             | <code>Array</code>    | The arguments with which the contract function that failed, was called, extended with the thrown exception, and the contract function, bound to the <code>this</code> it was called on. The bound contract function is always the last entry. The thrown exception is always the second-to-last entry. |

<a name="PostconditionViolation"></a>

## PostconditionViolation

**Kind**: global class  
<a name="new_PostconditionViolation_new"></a>

### new PostconditionViolation(contractFunction, condition, self, args)

<p>A PostconditionViolation is the means by which Toryt Contracts tells developers that it detected that a
  postcondition was violated when a contract function was called. The implementation of the contract function
  that was called, was executed and ended nominally, but the result or the resulting state did not conform.</p>

<p>If the postcondition itself is correct, this is a programming error on the part of the implementation.
  One should assume the system is now in an undefined state.</p>

<p>The developer wants to know</p>
<ul>
  <li>where the contract function was called in source code,</li>
  <li>what the arguments were of the instance of the call, at the time of the call (old),</li>
  <li>what the result of the call is, and what the state is of all relevant objects is, after the call, and</li>
  <li>which postcondition was violated in source code (which implies knowing which contract it is a part of).</li>
</ul>

<p>The state of the relevant objects after the call is a difficult subject, since we should assume the system
  is in an undefined state. Retrieving the state might not be possible, because invariants and preconditions
  will no longer be guaranteed.</p>

| Param            | Type                  | Description                                                                                                                                                                                                                                                                                                                              |
| ---------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contractFunction | <code>function</code> | The contract function that reports this violation                                                                                                                                                                                                                                                                                        |
| condition        | <code>function</code> | The condition that was violated                                                                                                                                                                                                                                                                                                          |
| self             |                       | The <code>this</code> that <code>contractFunction</code> was called on                                                                                                                                                                                                                                                                   |
| args             | <code>Array</code>    | The arguments with which the contract function that failed, was called, extended with the result of the implementation, and the contract function, bound to the <code>this</code> it was called on. The bound contract function is always the last entry. The result of the implementation execution is always the second-to-last entry. |

<a name="PreconditionViolation"></a>

## PreconditionViolation

**Kind**: global class  
<a name="new_PreconditionViolation_new"></a>

### new PreconditionViolation(contractFunction, condition, self, args)

A PreconditionViolation is the means by which Toryt Contracts tells developers that it detected that a precondition was
violated when a contract function was called. The implementation of the contract function that was called, was not
executed.

If the precondition itself is correct, this is a programming error on the part of the calling function. One should
assume the system is now in an undefined state.

The developer wants to know

<ul>
  <li>where the contract function was called in source code,</li>
  <li>what the arguments were of the instance of the call, and</li>
  <li>which precondition was violated in source code (which implies knowing which contract it is a part of).</li>
</ul>

| Param            | Type                  | Description                                                            |
| ---------------- | --------------------- | ---------------------------------------------------------------------- |
| contractFunction | <code>function</code> | The contract function that reports this violation                      |
| condition        | <code>function</code> | The condition that was violated                                        |
| self             |                       | The <code>this</code> that <code>contractFunction</code> was called on |
| args             | <code>Array</code>    | The arguments with which the contract function that failed, was called |

<a name="PromiseContract"></a>

## PromiseContract

**Kind**: global class  
<a name="new_PromiseContract_new"></a>

### new PromiseContract()

Contract for functions that return a `Promise`. Postconditions are applied to the successful `Promise` resolution.
Exception conditions are applied to the rejection of the returned `Promise`. `fastException` conditions are applied to
exceptions that the function throws while creating the `Promise`. Note that in `async` functions, the distinction
between `exception` and `fastException` conditions is lost. The fast postcondition of a `Promise` function is always
that the function must return a `Promise` instance. A `Promise` function that returns something else, or `null` or
`undefined` occasionally, is not supported.

<a name="mustNotHappen"></a>

## mustNotHappen

Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal that a function should
never throw exceptions, or never end nominally, or should never be called, because the conditions will always fail.

**Kind**: global constant  
<a name="falseCondition"></a>

## falseCondition()

Function that always returns <code>false</code>.

**Kind**: global function  
<a name="outcome"></a>

## outcome()

Returns the second-to-last element of an Array-like argument. In post- and exception conditions, this is the function
call result, respectively, the thrown exception.

**Kind**: global function  
<a name="callee"></a>

## callee()

Returns the last element of an Array-like argument. In post- and exception conditions, this is the called contract
function, bound to this. This can be used in recursive definitions.

**Kind**: global function  
<a name="GeneralContractFunction"></a>

## GeneralContractFunction : <code>function</code>

A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function given
as a parameter is a General Contract Function.

To be a General Contract Function, the subject must

<ul>
  <li>be a function,</li>
  <li>have a frozen `contract` property that refers to a AbstractContract,</li>
  <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
  <li>have a frozen `location` property, that has a value,</li>
  <li>have a frozen `bind` property, which is [bindContractFunction](#AbstractContract.bindContractFunction), and</li>
  <li>have a `name`, which is a string that gives information for a programmer to understand which contract
    function this is, and</li>
  <li>if the `implementation` function has a `prototype`, have a `prototype` property,
    <ul>
      <li>that is an object,</li>
      <li>that has a `constructor` property that is the contract function, and</li>
      <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
    </ul>
  </li>

**Kind**: global typedef  
**Properties**

| Name           | Type                                               |
| -------------- | -------------------------------------------------- |
| contract       | [<code>AbstractContract</code>](#AbstractContract) |
| implementation | <code>function</code>                              |
| location       | <code>string</code>                                |
| bind           | <code>function</code>                              |
| name           | <code>string</code>                                |

<a name="ContractFunction"></a>

## ContractFunction : [<code>GeneralContractFunction</code>](#GeneralContractFunction)

A Contract Function is an implementation of a Contract. This function verifies whether a function given as a parameter
is a Contract Function.

To be a Contract Function, the subject must

<ul>
  <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
  <li>have a frozen `location` property, which is a string that represents a location in source code,
    outside this library.</li>
</ul>

**Kind**: global typedef  
**Properties**

| Name     | Type                |
| -------- | ------------------- |
| location | <code>string</code> |
