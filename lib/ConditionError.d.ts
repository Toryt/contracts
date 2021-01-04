import { GeneralContractFunction } from './GeneralContractFunction'
import { AnyFunction } from './AnyFunction'
import { Condition } from './Condition'
import { ContractError } from './ContractError'

// noinspection LocalVariableNamingConventionJS
/**
 * ConditionError is the general supertype of all errors thrown by Toryt Contracts.
 * ConditionError itself is to be considered abstract.
 *
 * A ConditionError is a communication to developers, through which Toryt Contracts tries to describe as correctly
 * as possible what went wrong. The error reports a contract violation, or an error in a contract condition.
 * We assume the Toryt Contracts code itself will not fail.
 *
 * In general, we want to report to the developer:
 * <ul>
 *   <li>which condition was violated, or has an error, in source code, which implies knowing
 *     <ul>
 *       <li>of which contract the condition is a part of</li>
 *     </ul>
 *   </li>
 *   <li>in what circumstances the error occurred, which implies knowing
 *     <ul>
 *       <li>where the contract function was called, in source code, which implies knowing
 *         <ul>
 *           <li>which function called the contract function, and<li>
 *         </ul>
 *       </li>
 *       <li>which were were the arguments of the call of the contract function, during execution of this
 *         function call instance, and</li>
 *       <li>which contract function was called, which implies knowing
 *         <ul>
 *           <li>what the contract of the called contract function is, and<li>
 *           <li>which implementation of the contract was called.<li>
 *         </ul>
 *       </li>
 *     </ul>
 *   </li>
 * </ul>
 *
 * The condition is usually a short and anonymous JavaScript function. We will report the full implementation of the
 * condition, which might be multi-line.
 *
 * The contract is an object, and there is no automatic way to assign recognizable names to objects.
 * A contract does however have a `location` property that stores a line from a stacktrace that, in most JavaScript
 * engines, contains a reference to where the contract is created in source code.
 *
 * The actual arguments can easily be listed.
 *
 * The called contract function is actually 2 functions: the supplied naked implementation, and the doctored contract
 * function, which embeds the supplied naked implementation in contract verifications.
 *
 * The latter is the function called from outside. All doctored contract functions are different instances of the
 * same function definition in source code. It is not informative to communicate about this source code to the
 * developer, yet its call is what is relevant. A contract function does have a `location` property that stores a line
 * from a stacktrace that, in most JavaScript engines, contains a reference to where the contract function is created
 * in source code. The name of the contract function is used in communication. It is based on the implementation.
 *
 * The naked implementation will often be nameless. Showing the code is less relevant, because it will often be rather
 * long, but we concise version is used for lack of a better solution when there is no name. There is no way to create
 * a location reference to the naked implementation. The reference to where the contract function is created in source
 * code in the contract function `location` property will show the developer which implementation is used. The
 * implementation is either defined there, or the developer can navigate from there to the implementation definition in
 * a good IDE.
 *
 * The calling function cannot be retrieved in modern Javascript. ConditionError instances do however create a call
 * stack through which the developer can determine the calling function.
 *
 * Instances should be frozen before they are thrown.
 *
 * <h3>Invariants</h3>
 * <ul>
 *   <li>`contractFunction` is a frozen mandatory property, and refers to a contract function</li>
 *   <li>`condition` is a frozen mandatory property, and refers to a function</li>
 *   <li>`self` is a frozen property; it can be anything, also `null` or `undefined`</li>
 *   <li>`args` is a frozen property, and refers to an Array or Arguments instance</li>
 *   <li>`name` is a mandatory property, and refers to a string</li>
 *   <li>`message` is a frozen mandatory property, and refers to a string</li>
 *   <li>`moreDetail` is a mandatory property, and refers to a function</li>
 *   <li>`stack` is a read-only property, that returns a string, that starts with the instance's
 *     <code>name</code>>, the string ": ", and <code>message</code>, followed by the {@link #getDetails()},
 *     and by stack code references, that do not contain references to the inner workings of the Toryt
 *     Contracts library.</li>
 * </ul>
 */
declare class ConditionError extends ContractError {
  readonly contractFunction: GeneralContractFunction<AnyFunction, never>
  readonly condition: Condition
  readonly self: unknown
  readonly _args: ReadonlyArray<unknown>
  readonly args: Array<unknown>

  constructor(
    /* MUDO: We will put a correct GCF in, but it can be any GCF. It can be a GCF for AnyFunction, and any, all, or no
       exceptions.
       -
       We do not want to only accept GCFs where the exceptions are `unknown` (i.e., a GCF with a contract where the
       exception conditions can deal with anything as exception).
       -
       That is different from a GCF with or without a type limitation, but with 0 exception conditions
       (`exceptions === []`). That allows more exceptions than with a type limitation unknown. That is the most
       permissive GCF.
       -
       We don't want to only accept GCFs where the exceptions are `never` (i.e., a GCF with a contract where the
       exception conditions cannot be called).
       -
       We _don't care_ about the exceptions.
       -
       It is ok if the GCF's contract has exception conditions that work for no exceptions, or only for a particular
       type of exceptions. If will be internally ok when we get it, and that is all we need to know. */

    contractFunction: GeneralContractFunction<AnyFunction, never>,
    condition: Condition,
    self: unknown,
    args: ArrayLike<unknown>,
    rawStack: string
  );

  getDetails(): string
}
