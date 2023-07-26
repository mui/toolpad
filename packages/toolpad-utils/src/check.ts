/**
 * Quick object check - this is primarily used to tell
 * objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
export function isObject<T>(obj: T): boolean {
  return obj !== null && typeof obj === 'object';
}

export function isSet<T>(obj: T): boolean {
  return obj instanceof Set;
}

export function isMap<T>(obj: T): boolean {
  return obj instanceof Map;
}

export function isArray<T>(obj: T): boolean {
  return Array.isArray(obj);
}
