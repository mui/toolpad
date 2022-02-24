import { NextApiHandler } from 'next';
import getImportMap from '../../../../../src/getImportMap';
import renderPageHtml from '../../../../../src/renderPageHtml';

export default (async (req, res) => {
  const { code: html } = renderPageHtml({
    entry: `${req.url}/entry`,
    importMap: getImportMap(),
  });
  res.setHeader('content-type', 'text/html');
  res.send(html);
}) as NextApiHandler<string>;
