// TODO: Create a @mui/toolpad-utils package to house utilities like this one?

const weakMap = new WeakMap<any, string>();
let nextId = 0;

function getNextId(): string {
  const id = `object-id::${nextId}`;
  nextId += 1;
  return id;
}

/**
 * Used to generate ids for object instances.
 */
export function getObjectKey(object: any): string {
  let id = weakMap.get(object);
  if (!id) {
    id = getNextId();
    weakMap.set(object, id);
  }
  return id;
}
