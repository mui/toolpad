import * as React from 'react';

function isMac(): boolean {
  const userAgent = navigator.userAgent;
  return /Mac|iPod|iPhone|iPad/.test(userAgent);
}

export function getModifierKey(): string | JSX.Element {
  return isMac() ? '⌘' : <kbd>Ctrl</kbd>;
}
