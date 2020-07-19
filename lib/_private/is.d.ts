export declare function functionArguments(this:never, a: any): a is IArguments;

export declare function primitive(this:never, p: any): p is number | string | boolean;

export type StackLocation = string;
export declare function stackLocation(this:never, location: any): location is StackLocation;

export type Stack = string;
export declare function stack(this:never, stack: any): stack is Stack;

export declare function frozenOwnProperty(this:never, obj: object, propName: string): boolean;
