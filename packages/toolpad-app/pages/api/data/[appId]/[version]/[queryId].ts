import { ExecFetchResult } from '@mui/toolpad-core';
import { NextApiHandler } from 'next';
import { parseVersion } from '../../../../../src/server/data';
import handleDataRequest from '../../../../../src/server/handleDataRequest';
import { withReqResLogs } from '../../../../../src/server/logs/withLogs';
import { asArray } from '../../../../../src/utils/collections';

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
