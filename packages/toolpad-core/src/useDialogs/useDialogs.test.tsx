/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { renderHook, within, screen, waitFor, render } from '@testing-library/react';
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

    test('can close imperatively', async () => {
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.alert('Hello');

      const dialog = await screen.findByRole('dialog');

      await waitFor(() => expect(within(dialog).getByText('Hello')).toBeTruthy());

      await result.current.close(theDialog, undefined);

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
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

    test('can close imperatively', async () => {
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.confirm('Hello');

      const dialog = await screen.findByRole('dialog');

      await waitFor(() => expect(within(dialog).getByText('Hello')).toBeTruthy());

      await result.current.close(theDialog, true);

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
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

    test('can close imperatively', async () => {
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.prompt('Hello');

      const dialog = await screen.findByRole('dialog');

      await waitFor(() => expect(within(dialog).getByText('Hello')).toBeTruthy());

      await result.current.close(theDialog, 'goodbye');

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
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

    test('can close imperatively', async () => {
      function CustomDialog({ open, onClose }: DialogProps) {
        return open ? (
          <div role="dialog">
            Hello <button onClick={() => onClose()}>Close me</button>
          </div>
        ) : null;
      }
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.open(CustomDialog);

      const dialog = await screen.findByRole('dialog');

      await waitFor(() => expect(within(dialog).getByText('Hello')).toBeTruthy());

      await result.current.close(theDialog, null);

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
    });
  });

  describe('React Strict Mode behavior', () => {
    test('should not leave dialogs open when effect runs twice', async () => {
      function CustomDialog({ open }: DialogProps) {
        return open ? <div role="dialog">Custom Dialog Content</div> : null;
      }

      function TestComponent() {
        const dialogs = useDialogs();
        const dialogRef = React.useRef<Promise<void> | null>(null);

        React.useEffect(() => {
          const dialog = dialogs.open(CustomDialog);
          dialogRef.current = dialog;

          return () => {
            dialogs.close(dialog, undefined);
            dialogRef.current = null;
          };
        }, [dialogs]);

        React.useEffect(() => {
          const timeout = setTimeout(() => {
            if (dialogRef.current) {
              dialogs.close(dialogRef.current, undefined);
              dialogRef.current = null;
            }
          }, 50);
          return () => clearTimeout(timeout);
        });

        return <div>Test Component</div>;
      }

      render(
        <DialogsProvider>
          <TestComponent />
        </DialogsProvider>,
        { reactStrictMode: true },
      );

      await waitFor(
        async () => {
          const dialogs = screen.queryAllByRole('dialog');
          expect(dialogs.length).toBeLessThanOrEqual(0);
        },
        { timeout: 100 },
      );
    });
  });

  describe('stale closure', () => {
    test('can close dialog after multiple re-renders', async () => {
      const { result, rerender } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.alert('Hello');

      // Force multiple re-renders to create stale closures
      rerender();
      rerender();
      rerender();

      await screen.findByRole('dialog');

      // This should work even with stale closures
      await result.current.close(theDialog, undefined);

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
    });

    test('throws when closing unknown dialog', async () => {
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const fakeDialog = Promise.resolve(undefined);

      await expect(result.current.close(fakeDialog, undefined)).rejects.toThrow('dialog not found');
    });

    test('dialog still closes when onClose callback throws', async () => {
      const onCloseError = new Error('onClose failed');
      const onCloseMock = vi.fn().mockRejectedValue(onCloseError);
      const { result } = renderHook(() => useDialogs(), { wrapper: TestWrapper });

      const theDialog = result.current.alert('Hello', { onClose: onCloseMock });

      await screen.findByRole('dialog');

      // Close should throw the onClose error
      await expect(result.current.close(theDialog, undefined)).rejects.toThrow('onClose failed');

      // But dialog should still be closed in UI and promise should be resolved
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeFalsy());
      await expect(theDialog).resolves.toBeUndefined();
    });
  });
});
