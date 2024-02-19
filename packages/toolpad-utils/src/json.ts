export type Replacer = (this: object, key: PropertyKey, value: unknown) => unknown;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#circular_references
export function getCircularReplacer(): Replacer {
  const ancestors: object[] = [];
  return function replacer(key, value) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(value)) {
      return '[Circular]';
    }
    ancestors.push(value);
    return value;
  };
}

function replaceRecursiveImpl(obj: unknown, replacer: Replacer): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item, i) => {
      const newItem = replacer.call(obj, i, item);
      return replaceRecursiveImpl(newItem, replacer);
    });
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const newValue = replacer.call(obj, key, value);
        return [key, replaceRecursiveImpl(newValue, replacer)];
      }),
    );
  }
  return obj;
}

// Replaces nested properties using the same semantics as JSON.stringify
export function replaceRecursive(obj: unknown, replacer: Replacer): unknown {
  return (replaceRecursiveImpl({ '': obj }, replacer) as { '': unknown })[''];
}
