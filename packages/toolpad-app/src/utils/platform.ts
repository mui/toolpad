function isMac(): boolean {
  const userAgent = navigator.userAgent;
  return /Mac|iPod|iPhone|iPad/.test(userAgent);
}

export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}
