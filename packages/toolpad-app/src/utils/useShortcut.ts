import * as React from 'react';

export interface ShortCut {
  code: string;
  metaKey?: boolean;
}

export default function useShortcut({ code, metaKey = false }: ShortCut, handler: () => void) {
  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.code === code && event.metaKey === metaKey) {
        handler();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [code, metaKey, handler]);
}
