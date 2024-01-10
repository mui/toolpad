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
import { RUNTIME_CONFIG_WINDOW_PROPERTY, INITIAL_STATE_WINDOW_PROPERTY } from '../constants';
import createRuntimeState from '../runtime/createRuntimeState';
import type { RuntimeConfig } from '../types';
import type { RuntimeState } from '../runtime';
import { createAuthHandler } from './auth';

export interface PostProcessHtmlParams {
  config: RuntimeConfig;
  initialState: RuntimeState;
}

export function postProcessHtml(
  html: string,
  { config, initialState }: PostProcessHtmlParams,
): string {
  const serializedConfig = serializeJavascript(config, { ignoreFunction: true });
  const serializedInitialState = serializeJavascript(initialState, { isJSON: true });

  const toolpadScripts = [
    `<script>window[${JSON.stringify(
      RUNTIME_CONFIG_WINDOW_PROPERTY,
    )}] = ${serializedConfig}</script>`,
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

  handler.use('/api/data', project.dataManager.createDataHandler());

  const runtimeRpcServer = createRpcServer(project);
  handler.use('/api/runtime-rpc', createRpcHandler(runtimeRpcServer));

  if (process.env.TOOLPAD_AUTH_SECRET) {
    const authHandler = createAuthHandler(project.options.base);
    handler.use('/api/auth', express.urlencoded({ extended: true }), authHandler);
  }

  handler.use(
    asyncHandler(async (req, res) => {
      const htmlFilePath = path.resolve(project.getAppOutputFolder(), './index.html');

      const [runtimeConfig, dom] = await Promise.all([
        project.getRuntimeConfig(),
        project.loadDom(),
      ]);

      let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });

      html = postProcessHtml(html, {
        config: runtimeConfig,
        initialState: createRuntimeState({ dom }),
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).end(html);
    }),
  );

  return { handler, dispose: async () => undefined };
}
