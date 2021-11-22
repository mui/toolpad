type ArrayUpdate<T> = {
  [index: number]: T;
};

export function updateArray<T>(dest: T[], src: ArrayUpdate<T>): T[] {
  let result: T[] | undefined;
  for (const strIdx in src) {
    if (Object.prototype.hasOwnProperty.call(src, strIdx)) {
      const idx = Number(strIdx);
      if (!Number.isNaN(idx) && idx < dest.length && idx >= 0 && dest[idx] !== src[idx]) {
        result = result || [...dest];
        (result as any)[idx] = src[idx];
      }
    }
  }
  return result || dest;
}

export function update<T>(dest: T, src: Partial<T>): T {
  let result: T | undefined;
  for (const key in src) {
    if (dest[key] !== src[key]) {
      result = result || { ...dest };
      (result as any)[key] = src[key];
    }
  }
  return result || dest;
}

export function updateOrCreate<T>(dest: T | null | undefined, src: T): T {
  return dest ? update(dest, src) : src;
}

export function insert<T>(array: readonly T[], value: T, index: number): T[] {
  return [...array.slice(0, index), value, ...array.slice(index)];
}

export function omit<K extends string, T extends Record<K, unknown>>(
  obj: T,
  ...keys: readonly K[]
): Omit<T, K> {
  let result: T | undefined;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!result) {
        result = { ...obj };
      }
      delete result[key];
    }
  }

  return result || obj;
}

export function without<T>(array: readonly T[], value: T): readonly T[] {
  const result: T[] = [];

  let found = false;
  for (const elm of array) {
    if (elm === value) {
      found = true;
    } else {
      result.push(elm);
    }
  }

  return found ? result : array;
}
