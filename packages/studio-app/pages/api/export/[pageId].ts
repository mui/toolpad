import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import { getPage } from '../../../src/server/data';
import renderPageAsCode from '../../../src/renderPageAsCode';

export default (async (req, res) => {
  const page = await getPage(req.query.pageId as string);
  const generated = renderPageAsCode(page, { pretty: true });
  const transformed = transform(generated.code, {
    transforms: ['jsx', 'typescript'],
  });
  res.setHeader('content-type', 'application/javascript');
  if (req.query.dev) {
    // dev mode thta always fetches
    // TODO: this doesn't seem to work yet
    res.setHeader('cache-control', 'no-cache');
  }
  res.send(transformed.code);
}) as NextApiHandler<string>;
