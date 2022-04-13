import { NextApiHandler } from 'next';
import { findActiveDeployment } from '../../../../src/server/data';
import { asArray } from '../../../../src/utils/collections';
import { renderAppHtml } from '../../app/[appId]/[version]/[[...path]]';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    res.status(404);
    res.send('not Found');
    return;
  }

  res.setHeader('content-type', 'text/html');
  res.send(
    await renderAppHtml(appId, {
      version: activeDeployment.version,
      basename: `/deploy/${appId}`,
    }),
  );
}) as NextApiHandler<string>;
