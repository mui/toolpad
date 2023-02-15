import { NodeId, ExecFetchResult } from '@mui/toolpad-core';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import * as prisma from '../../prisma/generated/client';
import { ServerDataSource, VersionOrPreview, RuntimeState } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import { asArray } from '../utils/collections';
import applyTransform from '../toolpadDataSources/applyTransform';
import createRuntimeState from '../createRuntimeState';
import { APP_ID_LOCAL_MARKER } from '../constants';
import { saveLocalDom, loadLocalDom } from './localMode';

export type AppMeta = Omit<prisma.App, 'dom'>;

export async function saveDom(appId: string, app: appDom.AppDom): Promise<void> {
  await saveLocalDom(app);
}

export async function execQuery<P, Q>(
  appId: string,
  dataNode: appDom.QueryNode<Q>,
  params: Q,
): Promise<ExecFetchResult<any>> {
  const dataSource: ServerDataSource<P, Q, any> | undefined =
    dataNode.attributes.dataSource && serverDataSources[dataNode.attributes.dataSource.value];
  if (!dataSource) {
    throw new Error(
      `Unknown datasource "${dataNode.attributes.dataSource?.value}" for query "${dataNode.id}"`,
    );
  }

  const connectionParams = null;

  let result = await dataSource.exec(connectionParams, dataNode.attributes.query.value, params);

  if (appDom.isQuery(dataNode)) {
    const transformEnabled = dataNode.attributes.transformEnabled?.value;
    const transform = dataNode.attributes.transform?.value;
    if (transformEnabled && transform) {
      const jsServerRuntime = await createServerJsRuntime();
      result = {
        data: await applyTransform(jsServerRuntime, transform, result.data),
      };
    }
  }

  return result;
}

export async function dataSourceFetchPrivate<P, Q>(
  appId: string,
  dataSourceId: string,
  connectionId: NodeId | null,
  query: Q,
): Promise<any> {
  const dataSource: ServerDataSource<P, Q, any> | undefined = serverDataSources[dataSourceId];

  if (!dataSource) {
    throw new Error(`Unknown dataSource "${dataSourceId}"`);
  }

  if (!dataSource.execPrivate) {
    throw new Error(`No execPrivate available on datasource "${dataSourceId}"`);
  }

  const connectionParams: P | null = null;

  return dataSource.execPrivate(connectionParams, query);
}

export function parseVersion(param?: string | string[]): VersionOrPreview | null {
  if (!param) {
    return null;
  }
  const [maybeVersion] = asArray(param);
  if (maybeVersion === 'preview') {
    return maybeVersion;
  }
  const parsed = Number(maybeVersion);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function loadDom(): Promise<appDom.AppDom> {
  return loadLocalDom();
}

/**
 * Version of loadDom that returns a subset of the dom that doesn't contain sensitive information
 */
export async function loadRuntimeState(): Promise<RuntimeState> {
  return createRuntimeState({ appId: APP_ID_LOCAL_MARKER, dom: await loadDom() });
}
