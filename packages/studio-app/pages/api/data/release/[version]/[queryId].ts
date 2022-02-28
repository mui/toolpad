import { NextApiHandler } from 'next';
import handleDataRequest from '../../../../../src/server/handleDataRequest';
import { StudioApiResult } from '../../../../../src/types';
import { asArray } from '../../../../../src/utils/collections';

export default (async (req, res) => {
  const [release] = asArray(req.query.release);
  await handleDataRequest(req, res, { release });
}) as NextApiHandler<StudioApiResult<any>>;
