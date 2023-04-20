import * as React from 'react';

export interface ShortCut {
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  disabled?: boolean;
  preventDefault?: boolean;
}

export default function useShortcut(
  { key, metaKey = false, disabled = false, shiftKey = false, preventDefault = true }: ShortCut,
  handler: (event: KeyboardEvent) => void,
) {
  React.useEffect(() => {
    if (disabled) {
      return () => {};
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key &&
        (event.metaKey === metaKey || event.ctrlKey === metaKey) &&
        event.shiftKey === shiftKey
      ) {
        handler(event);
        if (preventDefault) {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [key, metaKey, shiftKey, handler, disabled, preventDefault]);
}
