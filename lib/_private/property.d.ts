export type PropertyName = string | number | symbol

export type Derivation<O extends object, R> = (this: O) => R

export declare function setAndFreeze(this:never, obj: object, propName: PropertyName, value: any): void;
export declare function configurableDerived<O extends object, R>(this:never, prototype: O, propertyName: PropertyName, derivation: Derivation<O, R>): void;
export declare function frozenDerived<O extends object, R>(this:never, prototype: O, propertyName: PropertyName, derivation: Derivation<O, R>): void;
export declare function frozenReadOnlyArray(this:never, prototype: object, propertyName: PropertyName, privatePropName: PropertyName): void;
