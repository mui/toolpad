export function asArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type Ensure<U, K extends PropertyKey> = K extends keyof U ? Require<U, K> : U & Record<K, unknown>;

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is Ensure<X, Y> {
  return obj.hasOwnProperty(prop);
}
