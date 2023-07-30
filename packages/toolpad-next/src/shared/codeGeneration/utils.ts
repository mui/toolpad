export function serializeObject(properties: Record<string, string>): string {
  return `{${Object.entries(properties)
    .map((entry) => entry.join(': '))
    .join(', ')}}`;
}
export function serializeArray(items: string[]): string {
  return `[${items.join(', ')}]`;
}

export type SerializedProperties<O> = {
  [K in keyof O]: string | (undefined extends O[K] ? undefined : never);
};
