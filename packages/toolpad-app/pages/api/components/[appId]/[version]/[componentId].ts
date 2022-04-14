import { NextApiHandler } from 'next';
import { transform } from 'sucrase';
import { asArray } from '../../../../../src/utils/collections';
import { loadVersionedDom, parseVersion } from '../../../../../src/server/data';
import { NodeId, VersionOrPreview } from '../../../../../src/types';
import * as appDom from '../../../../../src/appDom';

export interface RenderAppHtmlOptions {
  version: VersionOrPreview;
  basename: string;
}

export default (async (req, res) => {
  const [appId] = asArray(req.query.appId);
  const version = parseVersion(req.query.version);
  const [componentId] = asArray(req.query.componentId);
  if (!version) {
    res.status(404).end();
    return;
  }

  const dom = await loadVersionedDom(appId, version);
  console.log(version, appId, dom, componentId);

  const codeComponent = appDom.getMaybeNode(dom, componentId as NodeId, 'codeComponent');
  if (!codeComponent) {
    res.status(404).end();
    return;
  }

  const { code: compiled } = transform(codeComponent.attributes.code.value, {
    transforms: ['jsx', 'typescript'],
  });

  res.setHeader('content-type', 'application/javascript');
  res.send(compiled);
}) as NextApiHandler<string>;
