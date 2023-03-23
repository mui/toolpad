import { ExecFetchResult } from '@mui/toolpad-core';
import { NextApiHandler } from 'next';
import handleDataRequest from '../../../src/server/handleDataRequest';
import { withReqResLogs } from '../../../src/server/logs/withLogs';

const apiHandler = (async (req, res) => {
  await handleDataRequest(req, res);
}) as NextApiHandler<ExecFetchResult<any>>;

export default withReqResLogs(apiHandler);
