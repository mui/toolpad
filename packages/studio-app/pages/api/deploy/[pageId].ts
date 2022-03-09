import { NextApiHandler } from 'next';
import { getCapabilities } from '../../../src/capabilities';
import getImportMap from '../../../src/getImportMap';
import renderPageHtml from '../../../src/renderPageHtml';
import { findActiveDeployment } from '../../../src/server/data';
import { asArray } from '../../../src/utils/collections';

export default (async (req, res) => {
  const capabilities = await getCapabilities(req);
  if (!capabilities?.view) {
    res.status(403).end();
    return;
  }

  const [pageId] = asArray(req.query.pageId);
  const activeDeployment = await findActiveDeployment();

  if (!activeDeployment) {
    res.status(404);
    res.send('not Found');
    return;
  }

  const { code: html } = renderPageHtml({
    entry: `/api/release/${activeDeployment.version}/${pageId}/entry`,
    importMap: getImportMap(),
  });
  res.setHeader('content-type', 'text/html');
  res.send(html);
}) as NextApiHandler<string>;
