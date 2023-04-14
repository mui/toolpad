import { createServer } from 'vite';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as express from 'express';
import { Server } from 'http';
import config from '../config';
import { createViteConfig, getHtmlContent, postProcessHtml } from './toolpadAppBuilder';
import { loadDom } from './liveProject';
import { getAppOutputFolder } from './localMode';

export interface CreateViteConfigParams {
  server?: Server;
  root: string;
  base: string;
  canvas: boolean;
}

export interface ToolpadAppHandlerParams {
  server: Server;
  root: string;
  base: string;
}

export async function createDevHandler({ root, base, server }: ToolpadAppHandlerParams) {
  const devServer = await createServer(createViteConfig({ dev: true, root, base, server }));

  const router = express.Router();

  router.use((req, res, next) => {
    const oldEend = res.end;
    res.end = (data) => {
      if (!res.getHeader('content-type')) {
        console.log(res.req.url);
      }
      res.end = oldEend; // set function back to avoid the 'double-send'
      return res.end(data); // just call as normal with data
    };
    next();
  });

  router.use(devServer.middlewares);

  router.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    const canvas = req.query['toolpad-display'] === 'canvas';

    try {
      const dom = await loadDom();

      const template = getHtmlContent({ canvas });

      let html = await devServer.transformIndexHtml(url, template);

      html = postProcessHtml(html, { config, dom });

      res.status(200).set('content-type', 'text/html').end(html);
    } catch (e) {
      next(e);
    }
  });

  return router;
}

export async function createProdHandler({ root }: ToolpadAppHandlerParams) {
  const router = express.Router();

  router.use(express.static(getAppOutputFolder(root), { index: false }));

  router.use('*', async (req, res, next) => {
    try {
      const dom = await loadDom();

      const htmlFilePath = path.resolve(getAppOutputFolder(root), './index.html');
      let html = await fs.readFile(htmlFilePath, { encoding: 'utf-8' });

      html = postProcessHtml(html, { config, dom });

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
