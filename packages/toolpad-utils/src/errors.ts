import { hasOwnProperty } from './collections';
import { truncate } from './strings';

declare global {
  interface Error {
    code?: unknown;
  }
}

export type PlainObject = Record<string, unknown>;

export interface SerializedError extends PlainObject {
  message: string;
  name: string;
  stack?: string;
  code?: unknown;
}

export function serializeError(error: Error): SerializedError {
  const { message, name, stack, code } = error;
  return { message, name, stack, code };
}

/**
 * Creates a javascript `Error` from an unknown value if it's not already an error.
 * Does a best effort at inferring a message. Intended to be used typically in `catch`
 * blocks, as there is no way to enforce only `Error` objects being thrown.
 *
 * ```
 * try {
 *   // ...
 * } catch (rawError) {
 *   const error = errorFrom(rawError);
 *   console.assert(error instanceof Error);
 * }
 * ```
 */
export function errorFrom(maybeError: unknown): Error {
  if (maybeError instanceof Error) {
    return maybeError;
  }

  if (
    typeof maybeError === 'object' &&
    maybeError &&
    hasOwnProperty(maybeError, 'message') &&
    typeof maybeError.message === 'string'
  ) {
    return new Error(maybeError.message, { cause: maybeError });
  }

  if (typeof maybeError === 'string') {
    return new Error(maybeError, { cause: maybeError });
  }

  const message = truncate(String(JSON.stringify(maybeError)), 500);
  return new Error(message, { cause: maybeError });
}
