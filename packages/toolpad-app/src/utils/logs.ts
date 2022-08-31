export function debugLog(message: string, color: string): void {
  if (process.env.TOOLPAD_DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`%c[DEBUG] ${message}`, `color: ${color}`);
  }
}
