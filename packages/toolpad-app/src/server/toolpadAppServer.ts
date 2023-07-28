import * as path from 'path';
import * as fs from 'fs/promises';
import * as express from 'express';
import { Server } from 'http';
import config from '../config';
import { postProcessHtml } from './toolpadAppBuilder';
import { ToolpadProject, getAppOutputFolder } from './localMode';
import { asyncHandler } from '../utils/express';
import { createDataHandler } from './data';
import { basicAuthUnauthorized, checkBasicAuthHeader } from './basicAuth';

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
  const router = express.Router();

  router.use(express.static(getAppOutputFolder(project.root), { index: false }));

  // Allow static assets, block everything else
  router.use((req, res, next) => {
    if (checkBasicAuthHeader(req.headers.authorization ?? null)) {
      next();
      return;
    }
    basicAuthUnauthorized(res);
  });

  router.use('/api/data', createDataHandler(project));

  router.use(
    asyncHandler(async (req, res) => {
      const dom = await project.loadDom();

      const htmlFilePath = path.resolve(getAppOutputFolder(project.root), './index.html');
      let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });

      html = postProcessHtml(html, { config, dom });

      res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).end(html);
    }),
  );

  return router;
}
