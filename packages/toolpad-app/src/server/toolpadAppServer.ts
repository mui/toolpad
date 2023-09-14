import * as path from 'path';
import * as fs from 'fs/promises';
import { Server } from 'http';
import * as express from 'express';
import { postProcessHtml } from './toolpadAppBuilder';
import { ToolpadProject, getAppOutputFolder } from './localMode';
import { asyncHandler } from '../utils/express';
import { basicAuthUnauthorized, checkBasicAuthHeader } from './basicAuth';
import { createRpcRuntimeServer } from './rpcRuntimeServer';
import { createRpcHandler } from './rpc';
import createRuntimeState from '../runtime/createRuntimeState';

export interface CreateViteConfigParams {
  server?: Server;
  root: string;
  base: string;
  canvas: boolean;
}

export interface ToolpadAppHandlerParams {
  root: string;
}

export async function createProdHandler(project: ToolpadProject) {
  const handler = express.Router();

  handler.use(express.static(getAppOutputFolder(project.getRoot()), { index: false }));

  // Allow static assets, block everything else
  handler.use((req, res, next) => {
    if (checkBasicAuthHeader(req.headers.authorization ?? null)) {
      next();
      return;
    }
    basicAuthUnauthorized(res);
  });

  handler.use('/api/data', project.dataManager.createDataHandler());

  const runtimeRpcServer = createRpcRuntimeServer(project);
  handler.use('/api/runtime-rpc', createRpcHandler(runtimeRpcServer));

  handler.use(
    asyncHandler(async (req, res) => {
      const [dom, dataProviders] = await Promise.all([
        project.loadDom(),
        project.getDataProviders(),
      ]);

      const htmlFilePath = path.resolve(getAppOutputFolder(project.getRoot()), './index.html');
      let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });

      html = postProcessHtml(html, {
        config: project.getRuntimeConfig(),
        initialState: createRuntimeState({
          dom,
          dataProviders,
        }),
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).end(html);
    }),
  );

  return { handler };
}
