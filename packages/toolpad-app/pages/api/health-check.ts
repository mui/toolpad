import { NextApiHandler } from 'next';
import prettyBytes from 'pretty-bytes';
import { mapValues } from '../../src/utils/collections';

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
