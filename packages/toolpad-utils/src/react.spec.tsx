/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import { interleave } from './react';
import 'vitest-dom/extend-expect';

afterEach(cleanup);

test('handles empty', async () => {
  render(<div data-testid="container">{interleave([], <div>quux</div>)}</div>);
  expect(await screen.findByTestId('container')).toBeEmptyDOMElement();
});

test('handles single item', async () => {
  render(
    <div data-testid="container">{interleave([<div key={1}>foo</div>], <div>quux</div>)}</div>,
  );
  expect(await screen.findByTestId('container')).toContainHTML('<div>foo</div>');
});

test('interleaves multiple items', async () => {
  render(
    <div data-testid="container">
      {interleave(
        [<div key={1}>foo</div>, <div key={2}>bar</div>, <div key={3}>baz</div>],
        <div>quux</div>,
      )}
    </div>,
  );

  expect(await screen.findByTestId('container')).toContainHTML(
    '<div>foo</div><div>quux</div><div>bar</div><div>quux</div><div>baz</div>',
  );
});

test('interleaves strings', async () => {
  render(<div data-testid="container">{interleave(['foo', 'bar', 'baz'], <div>quux</div>)}</div>);

  expect(await screen.findByTestId('container')).toContainHTML(
    'foo<div>quux</div>bar<div>quux</div>baz',
  );
});

test('interleaves string separator', async () => {
  render(
    <div data-testid="container">
      {interleave([<div key={1}>foo</div>, <div key={2}>bar</div>, <div key={3}>baz</div>], 'quux')}
    </div>,
  );

  expect(await screen.findByTestId('container')).toContainHTML(
    '<div>foo</div>quux<div>bar</div>quux<div>baz</div>',
  );
});
