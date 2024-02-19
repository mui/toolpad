export const asyncDisposeSymbol: typeof Symbol.asyncDispose =
  Symbol.asyncDispose ?? Symbol('asyncDispose');

export async function using<T extends { [asyncDisposeSymbol]: () => void | Promise<void> }>(
  resource: T,
  callback: (resource: T) => Promise<void>,
) {
  try {
    await callback(resource);
  } finally {
    await resource[asyncDisposeSymbol]();
  }
}
