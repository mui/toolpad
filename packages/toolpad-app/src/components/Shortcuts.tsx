import * as React from 'react';

interface Shortcut {
  code: string;
  metaKey?: boolean;
}

export type ShortcutBinding = [
  shortcut: Shortcut,
  handler: React.KeyboardEventHandler<HTMLDivElement>,
];

export type ShortcutBindings = ShortcutBinding[];

export interface ShortcutScopeProps {
  bindings: ShortcutBindings;
  children?: React.ReactNode;
}

export function ShortcutScope({ bindings, children }: ShortcutScopeProps) {
  const bindingsRef = React.useRef(bindings);
  React.useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    for (const [shortcut, handler] of bindingsRef.current) {
      const metaKeyMatch =
        !!event.metaKey === !!shortcut.metaKey || !!event.ctrlKey === !!shortcut.metaKey;
      if (metaKeyMatch && event.code === shortcut.code) {
        event.stopPropagation();
        event.preventDefault();
        handler(event);
      }
    }
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div tabIndex={-1} style={{ display: 'contents' }} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
