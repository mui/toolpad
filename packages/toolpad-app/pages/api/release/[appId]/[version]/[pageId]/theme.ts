import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import renderThemeCode from '../../../../../../src/renderThemeCode';
import { loadVersionedDom, parseVersion } from '../../../../../../src/server/data';

import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);

  const version = parseVersion(req.query.version);
  if (!version) {
    res.status(404).end();
    return;
  }
  const dom = await loadVersionedDom(appId, version);

  const { code: theme } = renderThemeCode(dom);

  const { code: compiled } = transform(theme, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
