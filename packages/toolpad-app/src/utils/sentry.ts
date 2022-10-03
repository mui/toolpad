import * as Sentry from '@sentry/nextjs';

export function reportSentryError(error: Error) {
  Sentry.withScope(() => {
    Sentry.captureException(error);
  });
}
