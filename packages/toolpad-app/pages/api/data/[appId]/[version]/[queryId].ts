import { ExecFetchResult } from '@mui/toolpad-core';
import { NextApiHandler } from 'next';
import { parseVersion } from '../../../../../src/server/data';
import handleDataRequest from '../../../../../src/server/handleDataRequest';
import { withReqResLogs } from '../../../../../src/server/logs/withLogs';
import { asArray } from '../../../../../src/utils/collections';

export const config = {
  api: {
    // Supresses false positive nextjs warning "API resolved without sending a response" caused by Sentry
    // Sentry should fix this eventually: https://github.com/getsentry/sentry-javascript/issues/3852
    externalResolver: true,
  },
};

const apiHandler = (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  if (!appId) {
    throw new Error(`Missing path parameter "appId"`);
  }

  const version = parseVersion(req.query.version);
  if (!version) {
    res.status(404).end();
    return;
  }

  await handleDataRequest(req, res, { appId, version });
}) as NextApiHandler<ExecFetchResult<any>>;

export default withReqResLogs(apiHandler);
