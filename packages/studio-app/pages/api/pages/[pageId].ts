import { NextApiHandler } from 'next';
import { StudioPage } from '../../../src/types';
import { getPage, updatePage } from '../../../src/server/data';
import { createEndpoint } from '../../../src/utils/server';

const getPageHandler: NextApiHandler<StudioPage> = async (req, res) => {
  return res.json(await getPage(req.query.pageId as string));
};

const updatePageHandler: NextApiHandler<StudioPage> = async (req, res) => {
  return res.json(await updatePage(req.body as StudioPage));
};

export default createEndpoint({
  GET: getPageHandler,
  PUT: updatePageHandler,
});
