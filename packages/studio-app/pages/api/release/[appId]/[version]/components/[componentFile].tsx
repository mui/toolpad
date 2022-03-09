import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import * as path from 'path';
import { loadReleaseDom } from '../../../../../../src/server/data';
import { NodeId } from '../../../../../../src/types';
import * as studioDom from '../../../../../../src/studioDom';
import { asArray } from '../../../../../../src/utils/collections';

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const [version] = asArray(req.query.version);
  const [componentFile] = asArray(req.query.componentFile);

  const { name: componentId } = path.parse(componentFile);

  const dom = await loadReleaseDom(appId, version);

  const codeComponent = studioDom.getMaybeNode(dom, componentId as NodeId, 'codeComponent');

  if (!codeComponent) {
    res.status(404);
    res.end();
    return;
  }

  const { code: compiled } = transform(codeComponent.attributes.code.value, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
