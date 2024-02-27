/**
 * Applies changes to an object in an immutable way. The `dest` object will adopt the properties of
 * the `src` object. Object identity is preserved if the operation results in a no-op.
 */
export function update<T>(dest: T, src: Partial<T>): T {
  let result: T | undefined;
  Object.entries(src).forEach(([key, value]) => {
    if (dest[key as keyof T] !== value) {
      result = result || { ...dest };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = value;
    }
  });
  return result || dest;
}
/**
 * Applies changes to an object in an immutable way. The `dest` object will adopt the properties of
 * the `src` object. If `dest` is undefined, `src` will be used. Object identity is preserved if
 * the operation results in a no-op.
 */
export function updateOrCreate<T>(dest: T | null | undefined, src: NonNullable<T>): T {
  return dest ? update(dest, src) : src;
}

/**
 * Inserts a value in an immutable array.
 */
export function insert<T>(array: readonly T[], value: T, index: number): T[] {
  return [...array.slice(0, index), value, ...array.slice(index)];
}

/**
 * Updates a value in an immutable array.
 */
export function updateArray<T>(array: readonly T[], value: T, index: number): T[] {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

/**
 * Removes a value in an immutable array.
 */
export function remove<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Removes a set of properties from an object in an immutable way. Object identity is preserved if
 * the operation results in a no-op.
 */
export function omit<T, K extends keyof T>(obj: T, ...keys: readonly K[]): Omit<T, K> {
  let result: T | undefined;

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!result) {
        result = { ...obj };
      }
      delete result[key];
    }
  });

  return result || obj;
}

/**
 * Returns an object created from `obj` with only the specified `keys`. Object identity is preserved if
 * the operation results in a no-op.
 */
export function take<K extends string, T extends Record<K, unknown>>(
  obj: T,
  ...keys: readonly K[]
): Omit<T, Exclude<keyof T, K>> {
  const keySet = new Set<string>(keys);
  let result: T | undefined;

  Object.keys(obj).forEach((key) => {
    if (!keySet.has(key)) {
      if (!result) {
        result = { ...obj };
      }
      delete result[key as keyof T];
    }
  });

  return result || obj;
}
/**
 * Returns an array without any of its items equal to `value`. Object identity is preserved if
 * the operation results in a no-op.
 */
export function without<T>(array: readonly T[], value: T): readonly T[] {
  const result: T[] = [];

  let found = false;
  for (let i = 0; i < array.length; i += 1) {
    const elm = array[i];
    if (elm === value) {
      found = true;
    } else {
      result.push(elm);
    }
  }

  return found ? result : array;
}
