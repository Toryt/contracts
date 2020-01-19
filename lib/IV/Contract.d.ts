export type Condition = () => boolean

export interface ContractKwargs {
  pre: Condition[]
  post:Condition[]
  exception:Condition[]
}

export type AnyFunction = (...args: any[]) => any
export type AnyPromiseFunction = (...args: any[]) => Promise<any>

export class AbstractContract<F extends AnyFunction> {
  static isAGeneralContractFunction(f: any): boolean
  static isAContractFunction(f:any): boolean
  static falseCondition: Condition;
  static mustNotHappen: Condition;
  static root: AbstractContract<any>;

  static outcome(arg: IArguments): any // cannot be made generic, because it is static
  static callee(arg: IArguments): AnyFunction // cannot be made generic, because it is static

  pre: Condition[];
  post:Condition[];
  exception:Condition[];
  location: string;
  abstract: F;
  verify:boolean;
  verifyPostconditions:boolean;

  constructor(kwargs: ContractKwargs)
  implementation(implFunction: F): F & ContractFunction<F>
  isImplementedBy(candidate: F): boolean
}

interface PromiseContractConstructor<F extends AnyPromiseFunction> {
  new(): PromiseContract<F>
}

export class Contract<F extends AnyFunction> extends AbstractContract<F> {
  static isAContractFunction(f:any): boolean
  static falseCondition: Condition;
  static mustNotHappen: Condition;
  static root: AbstractContract<any>;
  static Promise: PromiseContractConstructor<any>;

  static outcome(arg: IArguments): any // cannot be made generic, because it is static
  static callee(arg: IArguments): () => any // cannot be made generic, because it is static

  constructor(kwargs: ContractKwargs)
}

export class PromiseContract<F extends AnyPromiseFunction> extends AbstractContract<F> {
  static isAContractFunction(f:any): boolean
  static falseCondition: Condition;
  static mustNotHappen: Condition;
  static resultIsAPromiseCondition: Condition;
  static root: AbstractContract<any>;

  static outcome(arg: IArguments): any // cannot be made generic, because it is static
  static callee(arg: IArguments): () => any // cannot be made generic, because it is static

  constructor(kwargs: ContractKwargs)
}

export class GeneralContractFunction<F extends AnyFunction> extends Function {
  name:string;
  contract: AbstractContract<F>;
  implementation: F;
  location:string;

  bind(...args: any[]): GeneralContractFunction<(...args: any[]) => ReturnType<F>>
}

export class ContractFunction<F extends AnyFunction> extends GeneralContractFunction<F> {
  contract: Contract<F>;

  bind(...args: any[]): ContractFunction<(...args: any[]) => ReturnType<F>>
}

export class PromiseContractFunction<F extends AnyPromiseFunction>
    extends GeneralContractFunction<F> {
  contract: PromiseContract<F>;

  bind(...args: any[]): PromiseContractFunction<(...args: any[]) => ReturnType<F>>
}
