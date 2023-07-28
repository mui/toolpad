import { NodeId, ExecFetchResult } from '@mui/toolpad-core';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import express from 'express';
import cors from 'cors';
import invariant from 'invariant';
import { errorFrom, serializeError, SerializedError } from '@mui/toolpad-utils/errors';
import { Methods, ServerDataSource, ToolpadProjectOptions } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import applyTransform from '../toolpadDataSources/applyTransform';
import { asyncHandler } from '../utils/express';
import type FunctionsManager from './FunctionsManager';
import type EnvManager from './EnvManager';
import type { RuntimeConfig } from '../config';

function withSerializedError<T extends { error?: unknown }>(
  withError: T,
): Omit<T, 'error'> & { error?: SerializedError } {
  const { error, ...withoutError } = withError;
  return withError.error
    ? { ...withoutError, error: serializeError(errorFrom(error)) }
    : withoutError;
}

interface IToolpadProject {
  options: ToolpadProjectOptions;
  getRoot(): string;
  loadDom(): Promise<appDom.AppDom>;
  saveDom(dom: appDom.AppDom): Promise<{ fingerprint: number }>;
  functionsManager: FunctionsManager;
  envManager: EnvManager;
  getRuntimeConfig: () => RuntimeConfig;
}

/**
 * Handles loading env files and watches for updates.
 */
export default class DataManager {
  private project: IToolpadProject;

  private dataSources: Map<string, ServerDataSource<any, any, any> | undefined>;

  constructor(project: IToolpadProject) {
    this.project = project;
    this.dataSources = new Map(
      Object.entries(serverDataSources).map(([key, value]) => [
        key,
        typeof value === 'function' ? value(project) : value,
      ]),
    );
  }

  async getConnectionParams<P = unknown>(connectionId: string | null): Promise<P | null> {
    const dom = await this.project.loadDom();
    const node = appDom.getNode(
      dom,
      connectionId as NodeId,
      'connection',
    ) as appDom.ConnectionNode<P>;
    return node.attributes.params.$$secret;
  }

  async setConnectionParams<P>(connectionId: NodeId, params: P): Promise<void> {
    let dom = await this.project.loadDom();
    const existing = appDom.getNode(dom, connectionId, 'connection');

    dom = appDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'params',
      appDom.createSecret(params),
    );

    await this.project.saveDom(dom);
  }

  async execQuery<P, Q>(dataNode: appDom.QueryNode<Q>, params: Q): Promise<ExecFetchResult<any>> {
    const dataSource: ServerDataSource<P, Q, any> | undefined = dataNode.attributes.dataSource
      ? this.dataSources.get(dataNode.attributes.dataSource)
      : undefined;
    if (!dataSource) {
      throw new Error(
        `Unknown datasource "${dataNode.attributes.dataSource}" for query "${dataNode.id}"`,
      );
    }

    let result = await dataSource.exec(null, dataNode.attributes.query, params);

    if (appDom.isQuery(dataNode)) {
      const transformEnabled = dataNode.attributes.transformEnabled;
      const transform = dataNode.attributes.transform;
      if (transformEnabled && transform) {
        const jsServerRuntime = await createServerJsRuntime(process.env);
        result = {
          data: await applyTransform(jsServerRuntime, transform, result.data),
        };
      }
    }

    return result;
  }

  async dataSourceFetchPrivate<P, Q>(
    dataSourceId: string,
    connectionId: NodeId | null,
    query: Q,
  ): Promise<any> {
    const dataSource: ServerDataSource<P, Q, any> | undefined = this.dataSources.get(dataSourceId);

    if (!dataSource) {
      throw new Error(`Unknown dataSource "${dataSourceId}"`);
    }

    if (!dataSource.execPrivate) {
      throw new Error(`No execPrivate available on datasource "${dataSourceId}"`);
    }

    return dataSource.execPrivate(null, query);
  }

  async dataSourceExecPrivate<P, Q, PQS extends Methods>(
    dataSourceId: string,
    method: keyof PQS,
    args: any[],
  ): Promise<any> {
    const dataSource = this.dataSources.get(dataSourceId) as
      | ServerDataSource<P, Q, any, PQS>
      | undefined;

    if (!dataSource) {
      throw new Error(`Unknown dataSource "${dataSourceId}"`);
    }

    if (!dataSource.api) {
      throw new Error(`No api available on datasource "${dataSourceId}"`);
    }

    return dataSource.api[method](...args);
  }

  createDataHandler(project: IToolpadProject) {
    const router = express.Router();

    router.use(
      cors({
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        // TODO: make this configurable
        origin: '*',
      }),
    );

    router.post(
      '/:pageName/:queryName',
      express.json(),
      asyncHandler(async (req, res) => {
        const { pageName, queryName } = req.params;

        invariant(typeof pageName === 'string', 'pageName url param required');

        invariant(typeof queryName === 'string', 'queryName url variable required');

        const dom = await project.loadDom();

        const page = appDom.getPageByName(dom, pageName);

        if (!page) {
          res.status(404).end();
          return;
        }

        const dataNode = appDom.getQueryByName(dom, page, queryName);

        if (!dataNode) {
          res.status(404).end();
          return;
        }

        if (!appDom.isQuery(dataNode)) {
          throw new Error(`Invalid node type for data request`);
        }

        try {
          const result = await this.execQuery(dataNode, req.body);
          res.json(withSerializedError(result));
        } catch (error) {
          res.json(withSerializedError({ error }));
        }
      }),
    );

    return router;
  }

  createDataSourcesHandler() {
    const router = express.Router();

    const handlerMap = new Map<String, Function | null | undefined>();
    Object.keys(serverDataSources).forEach((dataSourceId) => {
      const handler = this.dataSources.get(dataSourceId)?.createHandler?.();
      if (handler) {
        invariant(
          typeof handler === 'function',
          `Received a "${typeof handler}" instead of a "function" for the "${dataSourceId}" handler`,
        );
        handlerMap.set(dataSourceId, handler);
      }
    });

    router.get(
      '/:dataSource/*',
      asyncHandler(async (req, res) => {
        const dataSource = req.params.dataSource;

        if (!dataSource) {
          throw new Error(`Missing path parameter "dataSource"`);
        }

        const handler = handlerMap.get(dataSource);

        if (typeof handler === 'function') {
          return handler(this, req, res);
        }

        return res.status(404).json({ message: 'No handler found' });
      }),
    );

    return router;
  }
}
