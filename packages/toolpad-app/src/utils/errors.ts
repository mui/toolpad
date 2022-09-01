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
      // @ts-expect-error Remove after typescript 4.9
      // See https://github.com/microsoft/TypeScript/issues/48098
      cause: maybeError,
    });
  }
  if (typeof maybeError === 'string') {
    return new Error(maybeError, {
      // @ts-expect-error Remove after typescript 4.9
      // See https://github.com/microsoft/TypeScript/issues/48098
      cause: maybeError,
    });
  }
  const message = truncate(JSON.stringify(maybeError), 500);
  return new Error(message, {
    // @ts-expect-error Remove after typescript 4.9
    // See https://github.com/microsoft/TypeScript/issues/48098
    cause: maybeError,
  });
}
