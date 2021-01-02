export declare const maxLengthOfConciseRepresentation: number
export declare const lengthOfEndConciseRepresentation: number
export declare const conciseSeparator: string
export const namePrefix: '𝕋⚖️'

export declare function conciseCondition(prefix: string, f: Function): string

export declare function type<V>(v: V):
  V extends undefined ? 'undefined'
    : V extends null ? 'null'
      : V extends symbol ? 'symbol'
        : V extends number ? 'number'
          : V extends string ? 'string'
            : V extends boolean ? 'boolean'
              : V extends Math ? 'Math'
                : V extends JSON ? 'JSON'
                  : V extends IArguments ? 'arguments'
                    : V extends Function ? 'Function'
                      : V extends object ? NewableFunction['name']
                        : string

export declare function value(v: unknown): string

export declare function extensiveThrown(thrown: unknown): string
