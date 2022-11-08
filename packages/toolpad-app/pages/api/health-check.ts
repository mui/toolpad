import { NextApiHandler } from 'next';
import prettyBytes from 'pretty-bytes';
import { mapValues } from '../../src/utils/collections';

export const config = {
  api: {
    // Supresses false positive nextjs warning "API resolved without sending a response" caused by Sentry
    // Sentry should fix this eventually: https://github.com/getsentry/sentry-javascript/issues/3852
    externalResolver: true,
  },
};

interface HealthCheck {
  gitSha1: string | null;
  circleBuildNum: string | null;
  memoryUsage: NodeJS.MemoryUsage;
  memoryUsagePretty: Record<keyof NodeJS.MemoryUsage, string>;
}

const apiHandler = (async (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    gitSha1: process.env.GIT_SHA1 || null,
    circleBuildNum: process.env.CIRCLE_BUILD_NUM || null,
    memoryUsage,
    memoryUsagePretty: mapValues(memoryUsage, (usage) => prettyBytes(usage)),
  });
}) as NextApiHandler<HealthCheck>;

export default apiHandler;
