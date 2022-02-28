import { NextApiHandler } from 'next';
import handleDataRequest from '../../../../src/server/handleDataRequest';
import { StudioApiResult } from '../../../../src/types';

export default (async (req, res) =>
  handleDataRequest(req, res, { release: null })) as NextApiHandler<StudioApiResult<any>>;
