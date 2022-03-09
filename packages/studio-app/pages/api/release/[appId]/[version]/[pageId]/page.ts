import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import renderPageCode from '../../../../../../src/renderPageCode';
import { loadReleaseDom } from '../../../../../../src/server/data';
import { NodeId } from '../../../../../../src/types';

import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [version] = asArray(req.query.version);
  const [pageId] = asArray(req.query.pageId);
  const dom = await loadReleaseDom(appId, version);

  const { code: page } = renderPageCode(dom, pageId as NodeId, {
    appId,
    release: version,
  });

  const { code: compiled } = transform(page, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
