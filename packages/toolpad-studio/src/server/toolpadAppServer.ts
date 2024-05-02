import * as path from 'path';
import * as fs from 'fs/promises';
import { Server } from 'http';
import * as express from 'express';
import serializeJavascript from 'serialize-javascript';
import { ToolpadProject } from './localMode';
import { asyncHandler } from '../utils/express';
import { basicAuthUnauthorized, checkBasicAuthHeader } from './basicAuth';
import { createRpcServer } from './runtimeRpcServer';
import { createRpcHandler } from './rpc';
import { INITIAL_STATE_WINDOW_PROPERTY } from '../constants';
import createRuntimeState from '../runtime/createRuntimeState';
import type { RuntimeState } from '../runtime';
import { createAuthHandler, createRequireAuthMiddleware, getRequireAuthentication } from './auth';

export interface PostProcessHtmlParams {
  initialState: RuntimeState;
}

export function postProcessHtml(html: string, { initialState }: PostProcessHtmlParams): string {
  const serializedInitialState = serializeJavascript(initialState, { isJSON: true });

  const toolpadScripts = [
    `<script>window[${JSON.stringify(
      INITIAL_STATE_WINDOW_PROPERTY,
    )}] = ${serializedInitialState}</script>`,
  ];

  return html.replace(`<!-- __TOOLPAD_SCRIPTS__ -->`, () => toolpadScripts.join('\n'));
}

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

  handler.use(express.static(project.getAppOutputFolder(), { index: false }));

  // Allow static assets, block everything else
  handler.use((req, res, next) => {
    if (checkBasicAuthHeader(req.headers.authorization ?? null)) {
      next();
      return;
    }
    basicAuthUnauthorized(res);
  });

  const hasAuthentication = await getRequireAuthentication(project);
  if (hasAuthentication) {
    const authHandler = createAuthHandler(project);
    handler.use('/api/auth', express.urlencoded({ extended: true }), authHandler);

    handler.use(await createRequireAuthMiddleware(project));
  }

  handler.use('/api/data', project.dataManager.createDataHandler());

  const runtimeRpcServer = createRpcServer(project);
  handler.use('/api/runtime-rpc', createRpcHandler(runtimeRpcServer));

  handler.use(
    asyncHandler(async (req, res) => {
      const htmlFilePath = path.resolve(project.getAppOutputFolder(), './index.html');

      const [dom] = await Promise.all([project.loadDom()]);

      let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });

      html = postProcessHtml(html, {
        initialState: createRuntimeState({ dom }),
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).end(html);
    }),
  );

  return { handler, dispose: async () => undefined };
}
