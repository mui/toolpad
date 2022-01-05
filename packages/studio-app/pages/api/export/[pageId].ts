import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import { loadApp } from '../../../src/server/data';
import renderPageAsCode from '../../../src/renderPageAsCode';
import { NodeId } from '../../../src/types';

export default (async (req, res) => {
  const dom = await loadApp();
  const pageNodeId = req.query.pageId as NodeId;
  const generated = renderPageAsCode(dom, pageNodeId, { pretty: true });
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
