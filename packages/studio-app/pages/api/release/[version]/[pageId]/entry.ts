import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import { getCapabilities } from '../../../../../src/capabilities';
import renderEntryPoint from '../../../../../src/renderPageEntryCode';

export default (async (req, res) => {
  const capabilities = await getCapabilities(req);
  if (!capabilities?.view) {
    res.status(403).end();
    return;
  }

  const { code: entryPoint } = renderEntryPoint({
    pagePath: `./page`,
    themePath: `./theme`,
  });

  const { code: compiled } = transform(entryPoint, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
