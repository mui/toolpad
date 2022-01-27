/**
 * Makes the first letter of [str] uppercase.
 * Not locale aware.
 */
export function uncapitalize(str: string): string {
  return str.length > 0 ? str[0].toLowerCase() + str.slice(1) : '';
}

/**
 * Makes the first letter of [str] lowercase.
 * Not locale aware.
 */
export function capitalize(str: string): string {
  return str.length > 0 ? str[0].toUpperCase() + str.slice(1) : '';
}

/**
 * Joins all [parts] and camelcases the result
 */
export function camelCase(...parts: string[]): string {
  if (parts.length > 0) {
    const [first, ...rest] = parts;
    return uncapitalize(first) + rest.map((part) => capitalize(part)).join('');
  }
  return '';
}
