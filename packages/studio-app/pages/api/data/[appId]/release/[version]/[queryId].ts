import { NextApiHandler } from 'next';
import handleDataRequest from '../../../../../../src/server/handleDataRequest';
import { StudioApiResult } from '../../../../../../src/types';
import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [version] = asArray(req.query.version);
  await handleDataRequest(req, res, { appId, release: Number(version) });
}) as NextApiHandler<StudioApiResult<any>>;
