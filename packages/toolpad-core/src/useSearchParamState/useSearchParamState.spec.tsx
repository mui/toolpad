/**
 * @vitest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, test, afterEach, vi } from 'vitest';
import { useSearchParamState } from './useSearchParamState';

describe('useSearchParamState', () => {
  afterEach(() => {
    window.history.pushState({}, '', '');
  });

  test('should save state to a search parameter', () => {
    const { result, rerender } = renderHook(() => useSearchParamState('foo', 'bar'));

    expect(result.current[0]).toBe('bar');
    expect(window.location.search).toBe('');
    result.current[1]('baz');

    rerender();

    expect(result.current[0]).toBe('baz');
    expect(window.location.search).toBe('?foo=baz');
    result.current[1]('bar');

    rerender();

    expect(result.current[0]).toBe('bar');
    expect(window.location.search).toBe('');
  });

  test('should read state from a search parameter', () => {
    window.history.pushState({}, '', '?foo=baz');

    const { result, rerender } = renderHook(() => useSearchParamState('foo', 'bar'));

    expect(result.current[0]).toBe('baz');

    window.history.pushState({}, '', '?foo=bar');

    rerender();

    expect(result.current[0]).toBe('bar');
  });
});
