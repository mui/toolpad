export function asArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

type PropertiesOf<P> = Extract<keyof P, string>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type Ensure<U, K extends PropertyKey> = K extends keyof U ? Require<U, K> : U & Record<K, unknown>;

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is Ensure<X, Y> {
  return obj.hasOwnProperty(prop);
}

export function mapProperties<P, L extends PropertyKey, U>(
  obj: P,
  mapper: <K extends PropertiesOf<P>>(old: [K, P[K]]) => [L, U] | null,
): Record<L, U>;
export function mapProperties<U, V>(
  obj: Record<string, U>,
  mapper: (old: [string, U]) => [string, V] | null,
): Record<string, V> {
  return Object.fromEntries(
    Object.entries(obj).flatMap((entry) => {
      const mapped = mapper(entry);
      return mapped ? [mapped] : [];
    }),
  );
}

export function mapKeys<U>(
  obj: Record<string, U>,
  mapper: (old: string) => string,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => [mapper(key), value]);
}

export function mapValues<P, V>(
  obj: P,
  mapper: (old: P[PropertiesOf<P>], key: PropertiesOf<P>) => V,
): Record<PropertiesOf<P>, V> {
  return mapProperties(obj, ([key, value]) => [key, mapper(value, key)]);
}

export function filterValues<P>(obj: P, filter: (old: P[keyof P]) => boolean): Partial<P>;
export function filterValues<U>(
  obj: Record<string, U>,
  filter: (old: U) => boolean,
): Record<string, U>;
export function filterValues<U>(
  obj: Record<string, U>,
  filter: (old: U) => boolean,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => (filter(value) ? [key, value] : null));
}

export function union<T>(...sources: Set<T>[]): Set<T> {
  const result = new Set<T>();
  for (const source of sources) {
    for (const element of source) {
      result.add(element);
    }
  }
  return result;
}

export function intersection<T>(...sources: Set<T>[]): Set<T> {
  const result = new Set<T>(sources.length > 0 ? sources[0] : []);
  for (const source of sources.slice(1)) {
    for (const element of result) {
      if (!source.has(element)) {
        result.delete(element);
      }
    }
  }
  return result;
}

export function difference<T>(target: Set<T>, ...sources: Set<T>[]): Set<T> {
  const result = new Set<T>(target);
  for (const source of sources) {
    source.forEach((element) => result.delete(element));
  }
  return result;
}
