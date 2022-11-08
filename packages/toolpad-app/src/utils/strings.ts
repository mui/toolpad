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

export function isAbsoluteUrl(maybeUrl: string) {
  try {
    return !!new URL(maybeUrl);
  } catch {
    return false;
  }
}

export function removePrefix(input: string, prefix: string): string {
  return input.startsWith(prefix) ? input.slice(prefix.length) : input;
}

export function removeSuffix(input: string, suffix: string): string {
  return input.endsWith(suffix) ? input.slice(0, input.length - suffix.length) : input;
}

export function ensurePrefix(input: string, prefix: string): string {
  return input.startsWith(prefix) ? input : prefix + input;
}

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

export function findImports(src: string): string[] {
  return Array.from(src.matchAll(IMPORT_STATEMENT_REGEX), (match) => match[2]);
}

export function truncate(str: string, maxLength: number, dots: string = '…') {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + dots;
}
