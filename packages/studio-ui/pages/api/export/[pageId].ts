import { NextApiHandler } from 'next';
import { getPage } from '../../../lib/data';
import renderPageAsCode from '../../../lib/renderPageAsCode';

export default (async (req, res) => {
  const page = await getPage(req.query.pageId as string);
  const { code } = renderPageAsCode(page, { pretty: true, transforms: ['jsx', 'typescript'] });
  res.setHeader('content-type', 'application/javascript');
  if (req.query.dev) {
    // dev mode thta always fetches
    // TODO: this doesn't seem to work yet
    res.setHeader('cache-control', 'no-cache');
  }
  res.send(code);
}) as NextApiHandler<string>;
