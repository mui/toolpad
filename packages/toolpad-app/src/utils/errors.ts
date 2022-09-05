import { hasOwnProperty } from './collections';
import { truncate } from './strings';

export function parseError(maybeError: unknown): Error {
  if (maybeError instanceof Error) {
    return maybeError;
  }
  if (
    typeof maybeError === 'object' &&
    maybeError &&
    hasOwnProperty(maybeError, 'message') &&
    typeof maybeError.message! === 'string'
  ) {
    return new Error(maybeError.message, {
      // See https://github.com/microsoft/TypeScript/issues/48098
      cause: maybeError,
    });
  }
  if (typeof maybeError === 'string') {
    return new Error(maybeError, {
      // See https://github.com/microsoft/TypeScript/issues/48098
      cause: maybeError,
    });
  }
  const message = truncate(JSON.stringify(maybeError), 500);
  return new Error(message, {
    // See https://github.com/microsoft/TypeScript/issues/48098
    cause: maybeError,
  });
}
