declare const brand: unique symbol;

export interface Brand<B> {
  readonly [brand]: B;
}

// https://stackoverflow.com/a/56749647
export type Branded<A, B> = A & Brand<B>;

// See https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type ExpandNested<T> = T extends infer O ? { [K in keyof O]: Expand<O[K]> } : never;

/**
 * The inverse of Awaited.
 */
export type Awaitable<T> = T | Promise<T> | PromiseLike<T>;

export {};
