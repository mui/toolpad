import * as React from 'react';

const handledEvents = new WeakSet<React.SyntheticEvent>();

interface Shortcut {
  code: string;
  metaKey?: boolean;
}

type Binding = [shortcut: Shortcut, handler: () => void];

interface ShortcutScopeProps {
  bindings: Binding[];
  children?: React.ReactNode;
}

export function ShortcutScope({ bindings, children }: ShortcutScopeProps) {
  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (handledEvents.has(event)) {
        // Stop propagation
        return;
      }
      handledEvents.add(event);

      for (const [shortcut, handler] of bindings) {
        if (event.metaKey === !!shortcut.metaKey && event.code === shortcut.code) {
          handler();
        }
      }
    },
    [bindings],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div tabIndex={-1} style={{ outline: 'none' }} onKeyPress={handleKeyPress}>
      {children}
    </div>
  );
}
