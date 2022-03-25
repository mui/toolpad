import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import renderPageCode from '../../../../../../src/renderPageCode';
import { loadVersionedDom, parseVersion } from '../../../../../../src/server/data';
import { NodeId } from '../../../../../../src/types';

import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [pageId] = asArray(req.query.pageId);

  const version = parseVersion(req.query.version);
  if (!version) {
    res.status(404).end();
    return;
  }
  const dom = await loadVersionedDom(appId, version);

  const { code: page } = renderPageCode(appId, dom, pageId as NodeId, {
    version,
  });

  const { code: compiled } = transform(page, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
