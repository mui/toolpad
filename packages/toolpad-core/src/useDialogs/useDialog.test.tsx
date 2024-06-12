/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { renderHook, within, screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DialogProvider, useDialogs } from './useDialogs';

interface TestWrapperProps {
  children: React.ReactNode;
}

function TestWrapper({ children }: TestWrapperProps) {
  return <DialogProvider unmountAfter={0}>{children}</DialogProvider>;
}

describe('useDialogs', () => {
  describe('alert', () => {
    test('can show and hide', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.alert('Hello');

      rerender();

      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Ok' }));

      rerender();

      expect(await dialogResult).toBeUndefined();

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  describe('confirm', () => {
    test('can show and confirm', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.confirm('Hello');

      rerender();

      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Ok' }));

      rerender();

      expect(await dialogResult).toBe(true);

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });

    test('can show and cancel', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.confirm('Hello');

      rerender();

      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      rerender();

      expect(await dialogResult).toBe(false);

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  describe('prompt', () => {
    test('can show and take input', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.prompt('Hello');

      rerender();

      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.keyboard('Hello, World!');

      await userEvent.click(within(dialog).getByRole('button', { name: 'Ok' }));

      rerender();

      expect(await dialogResult).toBe('Hello, World!');

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });

    test('can show and cancel', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.prompt('Hello');

      rerender();

      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.keyboard('Hello, World!');

      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      rerender();

      expect(await dialogResult).toBe(null);

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });
});
