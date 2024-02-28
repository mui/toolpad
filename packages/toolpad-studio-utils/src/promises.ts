type AwaitedProps<P extends {}> = { [K in keyof P]: Awaited<P[K]> };

/**
 * Returns a Promise to an object with all the properties resolved as promises
 */
export async function resolveValues<P extends {}>(obj: P): Promise<AwaitedProps<P>> {
  const entries = Object.entries(obj).map(async ([key, value]) => [key, await value]);
  return Object.fromEntries(await Promise.all(entries)) as AwaitedProps<P>;
}
