import * as React from 'react';

export interface ShortCut {
  code: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  disabled?: boolean;
  preventDefault?: boolean;
}

export default function useShortcut(
  { code, metaKey = false, disabled = false, shiftKey = false, preventDefault = true }: ShortCut,
  handler: () => void,
) {
  React.useEffect(() => {
    if (disabled) {
      return () => {};
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.code === code &&
        (event.metaKey === metaKey || event.ctrlKey === metaKey) &&
        event.shiftKey === shiftKey
      ) {
        handler();
        if (preventDefault) {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [code, metaKey, shiftKey, handler, disabled, preventDefault]);
}
