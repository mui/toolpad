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

export function generateUniqueString(base: string, existingNames: Set<string>) {
  let i = 1;
  if (!existingNames.has(base)) {
    return base;
  }
  const newBase = base.replace(/\d+$/, '');
  let suggestion = newBase;
  while (existingNames.has(suggestion)) {
    suggestion = newBase + String(i);
    i += 1;
  }
  return suggestion;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function removeDiacritics(input: string): string {
  // See https://stackoverflow.com/a/37511463
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
