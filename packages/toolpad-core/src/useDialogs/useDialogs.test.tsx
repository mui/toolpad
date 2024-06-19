/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { renderHook, within, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DialogProps, useDialogs } from './useDialogs';
import { DialogsProvider } from './DialogsProvider';

interface TestWrapperProps {
  children: React.ReactNode;
}

function TestWrapper({ children }: TestWrapperProps) {
  return <DialogsProvider unmountAfter={0}>{children}</DialogsProvider>;
}

describe('useDialogs', () => {
  describe('alert', () => {
    test('can show and hide', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.alert('Hello');

      rerender();

      const dialog = await screen.findByRole('dialog');

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

      const dialog = await screen.findByRole('dialog');

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

      const dialog = await screen.findByRole('dialog');

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

      const dialog = await screen.findByRole('dialog');

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

      const dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.keyboard('Hello, World!');

      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      rerender();

      expect(await dialogResult).toBe(null);

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  describe('custom dialog', () => {
    test('can show and hide', async () => {
      function CustomDialog({ open, onClose }: DialogProps) {
        return open ? (
          <div role="dialog">
            Hello <button onClick={() => onClose()}>Close me</button>
          </div>
        ) : null;
      }
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      result.current.open(CustomDialog);

      const dialog = await screen.findByRole('dialog');

      rerender();

      expect(within(dialog).getByText('Hello')).toBeTruthy();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Close me' }));

      rerender();

      expect(screen.queryByRole('dialog')).toBeFalsy();
    });

    test('can pass a payload', async () => {
      function CustomDialog({ open, onClose, payload }: DialogProps<string>) {
        return open ? (
          <div role="dialog">
            {payload} <button onClick={() => onClose()}>Close me</button>
          </div>
        ) : null;
      }
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      result.current.open(CustomDialog, 'I am content');

      const dialog = await screen.findByRole('dialog');

      rerender();

      expect(within(dialog).getByText('I am content')).toBeTruthy();
    });

    test('can receive result', async () => {
      function CustomDialog({ open, onClose }: DialogProps<void, string>) {
        return open ? (
          <div role="dialog">
            Hello <button onClick={() => onClose('I am result')}>Close me</button>
          </div>
        ) : null;
      }
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const dialogResult = result.current.open(CustomDialog);

      const dialog = await screen.findByRole('dialog');

      rerender();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Close me' }));

      rerender();

      expect(await dialogResult).toBe('I am result');
    });
  });
});
