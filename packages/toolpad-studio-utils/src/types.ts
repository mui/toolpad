declare const brand: unique symbol;

export type WithControlledProp<
  V,
  K extends string = 'value',
  O extends string = K extends 'value' ? 'onChange' : `on${Capitalize<K>}Change`,
> = Record<K, V> & Record<O, (newValue: V) => void>;

export type ExactEntriesOf<P> = Exclude<{ [K in keyof P]: [K, P[K]] }[keyof P], undefined>[];

/**
 * The inverse of Awaited.
 */
export type Awaitable<T> = T | Promise<T> | PromiseLike<T>;

/**
 * @example
 * type T0 = Join<[1, 2, 3, 4], '.'>;  // '1.2.3.4'
 * type T1 = Join<['foo', 'bar', 'baz'], '-'>;  // 'foo-bar-baz'
 * type T2 = Join<[], '.'>;  // ''
 */
export type Join<T extends unknown[], D extends string> = T extends []
  ? ''
  : T extends [string | number | boolean | bigint]
    ? `${T[0]}`
    : T extends [string | number | boolean | bigint, ...infer U]
      ? `${T[0]}${D}${Join<U, D>}`
      : string;

/**
 * @example
 * type T0 = Split<'foo', '.'>;  // ['foo']
 * type T1 = Split<'foo.bar.baz', '.'>;  // ['foo', 'bar', 'baz']
 * type T2 = Split<'foo.bar', ''>;  // ['f', 'o', 'o', '.', 'b', 'a', 'r']
 */
export type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S];

/**
 * @example
 * type T0 = CapitalizeAll<['foo', 'bar']>;  // ['Foo', 'Bar']
 * type T1 = CapitalizeAll<[]>;  // []
 */
export type CapitalizeAll<T extends string[]> = T extends []
  ? []
  : T extends [string, ...infer U]
    ? U extends string[]
      ? [Capitalize<T[0]>, ...CapitalizeAll<U>]
      : never
    : never;

/**
 * @example
 * type T0 = CapitalizeAll<['foo', 'bar', 'baz']>;  // ['foo', 'Bar', 'Baz']
 * type T1 = CapitalizeAll<['foo']>;  // ['foo']
 * type T2 = CapitalizeAll<[]>;  // []
 */
export type CapitalizeTail<T extends string[]> = T extends []
  ? []
  : T extends [string, ...infer U]
    ? U extends string[]
      ? [T[0], ...CapitalizeAll<U>]
      : never
    : never;

/**
 * sString template type that converts snake-case to camel-case
 * @example
 * type T0 = SnakeToCamel<'foo-bar-baz'>;  // 'fooBarBaz'
 * type T1 = CapitalizeAll<'foo'>;  // 'foo'
 * type T2 = CapitalizeAll<''>;  // ''
 */
export type SnakeToCamel<T extends string> = Join<CapitalizeTail<Split<T, '-'>>, ''>;

/**
 * The inverso of NonNullable
 */
export type Maybe<T> = T | undefined | null;

export type ValueOf<T> = T[keyof T];

export interface Brand<B> {
  readonly [brand]: B;
}

// https://stackoverflow.com/a/56749647
export type Branded<A, B> = A & Brand<B>;

// See https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type ExpandNested<T> = T extends infer O ? { [K in keyof O]: Expand<O[K]> } : never;

export {};
