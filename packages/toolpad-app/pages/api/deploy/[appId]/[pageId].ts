import { NextApiHandler } from 'next';
import getImportMap from '../../../../src/getImportMap';
import renderPageHtml from '../../../../src/renderPageHtml';
import { findActiveDeployment } from '../../../../src/server/data';
import { asArray } from '../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    res.status(404);
    res.send('not Found');
    return;
  }

  const [pageId] = asArray(req.query.pageId);
  const { code: html } = renderPageHtml({
    entry: `/release/${appId}/${activeDeployment.release.version}/${pageId}/entry`,
    importMap: getImportMap(),
  });
  res.setHeader('content-type', 'text/html');
  res.send(html);
}) as NextApiHandler<string>;
