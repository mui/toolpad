import { NextApiHandler } from 'next';
import { loadLocalDom } from '../../../src/server/localMode';
import { createBuilder } from '../../../src/server/runtimeBuild';

let builderPromise: ReturnType<typeof createBuilder> | undefined;

async function getBuilder() {
  if (!builderPromise) {
    const initialDom = await loadLocalDom();
    builderPromise = createBuilder(initialDom);
  }
  return builderPromise;
}

const apiHandler = (async (req, res) => {
  const builder = await getBuilder();
  const output = await builder.rebuild();
  const content = output.outputFiles[0].text;
  res.setHeader('content-type', 'application/javascript');
  res.send(content);
}) as NextApiHandler<string>;

export default apiHandler;
