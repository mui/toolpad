import { describe, test, expect } from 'vitest';
import {
  findImports,
  capitalize,
  uncapitalize,
  pascalCase,
  camelCase,
  guessTitle,
} from './strings';

describe('findImports', () => {
  test('finds all imports', () => {
    const imports = findImports(`
import {
  Component
} from '@angular2/core';
import defaultMember from "module-1";
import   *    as name from "module-2  ";
import   {  member }   from "  module-3";
import { member as alias } from "module-4";
import { member1 ,
member2 } from "module-5";
import { member1 , member2 as alias2 , member3 as alias3 } from "module-6";
import defaultMember, { member, member } from "module-7";
import defaultMember, * as name from "module-8";
import "module-9";
    import "module-10";
import * from './smdn';
  `);

    expect(imports[0]).toBe('@angular2/core');
    expect(imports[1]).toBe('module-1');
    expect(imports[2]).toBe('module-2  ');
    expect(imports[3]).toBe('module-3');
    expect(imports[4]).toBe('module-4');
    expect(imports[5]).toBe('module-5');
    expect(imports[6]).toBe('module-6');
    expect(imports[7]).toBe('module-7');
    expect(imports[8]).toBe('module-8');
    expect(imports[9]).toBe('module-9');
    expect(imports[10]).toBe('module-10');
    expect(imports[11]).toBe('./smdn');
  });
});

describe('capitalize', () => {
  test.each([
    ['foo', 'Foo'],
    ['FOO', 'FOO'],
    ['fOO', 'FOO'],
    ['', ''],
    ['a', 'A'],
    ['A', 'A'],
    ['-', '-'],
  ])('should convert %p to %p', (got, expected) => {
    expect(capitalize(got)).toEqual(expected);
  });
});

describe('uncapitalize', () => {
  test.each([
    ['foo', 'foo'],
    ['FOO', 'fOO'],
    ['fOO', 'fOO'],
    ['', ''],
    ['a', 'a'],
    ['A', 'a'],
    ['-', '-'],
  ])('should convert %p to %p', (got, expected) => {
    expect(uncapitalize(got)).toEqual(expected);
  });
});

describe('pascalCase', () => {
  test.each([
    [['foo'], 'Foo'],
    [['foo', 'bar'], 'FooBar'],
    [['FOO', 'BAR'], 'FooBar'],
    [['foo', '-', 'bar'], 'Foo-Bar'],
    [[''], ''],
  ])('should convert %p to %p', (got, expected) => {
    expect(pascalCase(...got)).toEqual(expected);
  });
});

describe('camelCase', () => {
  test.each([
    [['foo'], 'foo'],
    [['foo', 'bar'], 'fooBar'],
    [['foo', '-', 'bar'], 'foo-Bar'],
    [['foo', 'bar', 'baz'], 'fooBarBaz'],
    [[''], ''],
  ])('should convert %p to %p', (got, expected) => {
    expect(camelCase(...got)).toEqual(expected);
  });
});

describe('guessTitle', () => {
  test.each([
    ['camelCaseExample', 'Camel Case Example'],
    ['snake_case_example', 'Snake Case Example'],
    ['kebab-case-example', 'Kebab Case Example'],
    ['ACRONYMExample', 'Acronym Example'],
    ['helloACRONYMExample', 'Hello Acronym Example'],
    ['HelloACRONYMExample', 'Hello Acronym Example'],
    ['example123', 'Example 123'],
    ['example123Wat', 'Example 123 Wat'],
    ['example123more456', 'Example 123 More 456'],
  ])('should split %p into %p', (got, expected) => {
    expect(guessTitle(got)).toEqual(expected);
  });
});
