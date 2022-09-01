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
      // @ts-expect-error https://github.com/microsoft/TypeScript/issues/50583
      cause: maybeError,
    });
  }
  if (typeof maybeError === 'string') {
    return new Error(maybeError, {
      // @ts-expect-error https://github.com/microsoft/TypeScript/issues/50583
      cause: maybeError,
    });
  }
  const message = truncate(JSON.stringify(maybeError), 500);
  return new Error(message, {
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/50583
    cause: maybeError,
  });
}
