type ArrayUpdate<T> = {
  [index: number]: T;
};

export function updateArray<T>(dest: T[], src: ArrayUpdate<T>): T[] {
  let result: T[] | undefined;
  Object.entries(src).forEach(([strIdx, value]) => {
    const idx = Number(strIdx);
    if (!Number.isNaN(idx) && idx < dest.length && idx >= 0 && dest[idx] !== value) {
      result = result || [...dest];
      (result as any)[idx] = value;
    }
  });
  return result || dest;
}

export function update<T>(dest: T, src: Partial<T>): T {
  let result: T | undefined;
  Object.entries(src).forEach(([key, value]) => {
    if (dest[key as keyof T] !== value) {
      result = result || { ...dest };
      (result as any)[key] = value;
    }
  });
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
