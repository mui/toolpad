import { NextApiHandler } from 'next';
import { getCapabilities } from '../../../../../src/capabilities';
import getImportMap from '../../../../../src/getImportMap';
import renderPageHtml from '../../../../../src/renderPageHtml';

export default (async (req, res) => {
  const capabilities = await getCapabilities(req);
  if (!capabilities?.view) {
    res.status(403).end();
    return;
  }

  const { code: html } = renderPageHtml({
    entry: `${req.url}/entry`,
    importMap: getImportMap(),
  });
  res.setHeader('content-type', 'text/html');
  res.send(html);
}) as NextApiHandler<string>;
