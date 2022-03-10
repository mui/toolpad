import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import renderThemeCode from '../../../../../../src/renderThemeCode';
import { loadReleaseDom } from '../../../../../../src/server/data';

import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [version] = asArray(req.query.version);
  const dom = await loadReleaseDom(appId, Number(version));

  const { code: theme } = renderThemeCode(dom);

  const { code: compiled } = transform(theme, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
