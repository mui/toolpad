import { NextApiHandler } from 'next';
import handleDataRequest from '../../../../../../src/server/handleDataRequest';
import { StudioApiResult } from '../../../../../../src/types';
import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [release] = asArray(req.query.release);
  await handleDataRequest(req, res, { appId, release });
}) as NextApiHandler<StudioApiResult<any>>;
