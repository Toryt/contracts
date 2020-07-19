export declare function functionArguments(a: any): a is IArguments;

export declare function primitive(p: any): p is number | string | boolean;

export type StackLocation = string;
export declare function stackLocation(location: any): location is StackLocation;

export type Stack = string;
export declare function stack(stack: any): stack is Stack;

export declare function frozenOwnProperty(obj: object, propName: string): boolean;
