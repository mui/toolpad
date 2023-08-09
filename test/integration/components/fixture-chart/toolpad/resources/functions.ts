export function neverResolving() {
  return new Promise(() => {});
}

export async function throws() {
  throw new Error('BOOM!');
}
