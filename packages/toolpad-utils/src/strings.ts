import title from 'title';

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
 * Capitalizes and joins all [parts].
 */
export function pascalCase(...parts: string[]): string {
  return parts.map((part) => capitalize(part.toLowerCase())).join('');
}

/**
 * Joins all [parts] and camelcases the result
 */
export function camelCase(...parts: string[]): string {
  if (parts.length > 0) {
    const [first, ...rest] = parts;
    return uncapitalize(first) + pascalCase(...rest);
  }
  return '';
}

/**
 * Generates a string for `base` by add a number until it's unique amongst a set of predefined names.
 */
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

/**
 * Escape string for use in HTML.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalizes and removes all diacritics from a javascript string.
 *
 * See https://stackoverflow.com/a/37511463
 */
export function removeDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function isAbsoluteUrl(maybeUrl: string) {
  try {
    return !!new URL(maybeUrl);
  } catch {
    return false;
  }
}

/**
 * Removes a prefix from a string if it starts with it.
 */
export function removePrefix(input: string, prefix: string): string {
  return input.startsWith(prefix) ? input.slice(prefix.length) : input;
}

/**
 * Removes a suffix from a string if it ends with it.
 */
export function removeSuffix(input: string, suffix: string): string {
  return input.endsWith(suffix) ? input.slice(0, -suffix.length) : input;
}

/**
 * Adds a prefix to a string if it doesn't start with it.
 */
export function ensurePrefix(input: string, prefix: string): string {
  return input.startsWith(prefix) ? input : prefix + input;
}

/**
 * Adds a suffix to a string if it doesn't end with it.
 */
export function ensureSuffix(input: string, suffix: string): string {
  return input.endsWith(suffix) ? input : input + suffix;
}

/**
 * Regex to statically find all static import statements
 *
 * Tested against:
 *   import {
 *     Component
 *   } from '@angular2/core';
 *   import defaultMember from "module-name";
 *   import   *    as name from "module-name  ";
 *   import   {  member }   from "  module-name";
 *   import { member as alias } from "module-name";
 *   import { member1 ,
 *   member2 } from "module-name";
 *   import { member1 , member2 as alias2 , member3 as alias3 } from "module-name";
 *   import defaultMember, { member, member } from "module-name";
 *   import defaultMember, * as name from "module-name";
 *   import "module-name";
 *   import * from './smdn';
 */
const IMPORT_STATEMENT_REGEX =
  /^\s*import(?:["'\s]*([\w*{}\n, ]+)from\s*)?["'\s]*([^"']+)["'\s].*/gm;

/**
 * Statically analyses a javascript source code for import statements and return the specifiers.
 *
 * NOTE: This function does a best effort without parsing the code. The result may contain false
 *       positives
 */
export function findImports(src: string): string[] {
  return Array.from(src.matchAll(IMPORT_STATEMENT_REGEX), (match) => match[2]);
}

/**
 * Limits the length of a string and adds ellipsis if necessary.
 */
export function truncate(str: string, maxLength: number, dots: string = '...') {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + dots;
}

/**
 * Prepend a prefix to each line in the text
 */
export function prependLines(text: string, prefix: string): string {
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}

/**
 * Indent the text with [length] number of spaces
 */
export function indent(text: string, length = 2): string {
  return prependLines(text, ' '.repeat(length));
}

/**
 * Returns true if the string is a valid javascript identifier
 */
export function isValidJsIdentifier(base: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(base);
}

export function guessTitle(str: string): string {
  // Replace snake_case with space
  str = str.replace(/[_-]/g, ' ');
  // Split camelCase
  str = str.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  // Split acronyms
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  // Split numbers
  str = str.replace(/([a-zA-Z])(\d+)/g, '$1 $2');
  str = str.replace(/(\d+)([a-zA-Z])/g, '$1 $2');

  return title(str);
}
