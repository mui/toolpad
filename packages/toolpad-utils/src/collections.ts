export function asArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

type PropertiesOf<P> = Extract<keyof P, string>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type Ensure<U, K extends PropertyKey> = K extends keyof U ? Require<U, K> : U & Record<K, unknown>;

/**
 * Type aware version of Object.protoype.hasOwnProperty.
 * See https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is Ensure<X, Y> {
  return obj.hasOwnProperty(prop);
}

/**
 * Maps `obj` to a new object. The `mapper` function receives an entry array of key and value and
 * is allowed to manipulate both. It can also return `null` to omit a property from the result.
 */
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

/**
 * Maps an objects' property keys. The result is a new object with the mapped keys, but the same values.
 */
export function mapKeys<U>(
  obj: Record<string, U>,
  mapper: (old: string) => string,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => [mapper(key), value]);
}

/**
 * Maps an objects' property values. The result is a new object with the same keys, but mapped values.
 */
export function mapValues<P, V>(
  obj: P,
  mapper: (old: P[PropertiesOf<P>], key: PropertiesOf<P>) => V,
): Record<PropertiesOf<P>, V> {
  return mapProperties(obj, ([key, value]) => [key, mapper(value, key)]);
}
/**
 * Filters an objects' property values. Similar to `array.filter` but for objects. The result is a new
 * object with all the properties removed for which `filter` returned `false`.
 */
export function filterValues<K extends PropertyKey, P, Q extends P>(
  obj: Record<K, P>,
  filter: (old: P) => old is Q,
): Record<K, Q>;
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

/**
 * Filters an objects' property keys. Similar to `array.filter` but for objects. The result is a new
 * object with all the properties removed for which `filter` returned `false`.
 */
export function filterKeys<P>(obj: P, filter: (old: keyof P) => boolean): Partial<P>;
export function filterKeys<U>(
  obj: Record<string, U>,
  filter: (old: string) => boolean,
): Record<string, U>;
export function filterKeys<U>(
  obj: Record<string, U>,
  filter: (old: string) => boolean,
): Record<string, U> {
  return mapProperties(obj, ([key, value]) => (filter(key) ? [key, value] : null));
}

/**
 * check if two objects are deeply equal and support  Set, Map, Date, Array, Object
 */
// Reference code https://github.com/vuejs/vue/blob/49b6bd4264c25ea41408f066a1835f38bf6fe9f1/src/shared/util.ts#L297
export function isDeepEqual<T = unknown>(obj: T, objToCompare: T): boolean {
  const isObject = <U>(object: U) => {
    return object != null && typeof object === 'object';
  };

  if (obj === objToCompare) {
    return true;
  }

  const isArrayA = Array.isArray(obj);
  const isArrayB = Array.isArray(objToCompare);
  if (isObject(obj) && isObject(objToCompare)) {
    try {
      if (obj instanceof Set && objToCompare instanceof Set) {
        return obj.size === objToCompare.size && isDeepEqual([...obj], [...objToCompare]);
      }

      if (obj instanceof Map && objToCompare instanceof Map) {
        return obj.size === objToCompare.size && isDeepEqual([...obj], [...objToCompare]);
      }

      if (isArrayA && isArrayB) {
        return (
          obj.length === objToCompare.length &&
          obj.every((e: string, i: number) => {
            return isDeepEqual(e, objToCompare[i]);
          })
        );
      }

      if (obj instanceof Date && objToCompare instanceof Date) {
        return obj.getTime() === objToCompare.getTime();
      }

      if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(obj as Object);
        const keysB = Object.keys(objToCompare as Object);
        return (
          keysA.length === keysB.length &&
          keysA.every((key: string) => {
            return isDeepEqual(
              (obj as Record<string, unknown>)[key],
              (objToCompare as Record<string, unknown>)[key],
            );
          })
        );
      }
      return false;
    } catch (e) {
      return false;
    }
  } else if (!isObject(obj) && !isObject(objToCompare)) {
    return obj === objToCompare;
  } else {
    return false;
  }
}

/**
 * deep clone an object
 */
export function isDeepClone<T>(val: T) {
  if (Object.prototype.toString.call(val) === '[object Object]') {
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(val as T as Object)) {
      res[key] = isDeepClone(val[key as keyof T]);
    }
    return res as T;
  }

  if (Array.isArray(val)) {
    return val.slice() as T;
  }

  if (val instanceof Set) {
    return new Set([...val]) as T;
  }

  if (val instanceof Map) {
    return new Map([...val]) as T;
  }

  return val as T;
}
