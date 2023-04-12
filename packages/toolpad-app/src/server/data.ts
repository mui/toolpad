import { NodeId, ExecFetchResult } from '@mui/toolpad-core';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import { ServerDataSource, RuntimeState } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import applyTransform from '../toolpadDataSources/applyTransform';
import createRuntimeState from '../createRuntimeState';
import { loadDom, saveDom } from './liveProject';

export async function getConnectionParams<P = unknown>(
  connectionId: string | null,
): Promise<P | null> {
  const dom = await loadDom();
  const node = appDom.getNode(
    dom,
    connectionId as NodeId,
    'connection',
  ) as appDom.ConnectionNode<P>;
  return node.attributes.params.value;
}

export async function setConnectionParams<P>(connectionId: NodeId, params: P): Promise<void> {
  let dom = await loadDom();
  const existing = appDom.getNode(dom, connectionId, 'connection');

  dom = appDom.setNodeNamespacedProp(
    dom,
    existing,
    'attributes',
    'params',
    appDom.createSecret(params),
  );

  await saveDom(dom);
}

export async function execQuery<P, Q>(
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

  let result = await dataSource.exec(null, dataNode.attributes.query.value, params);

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

  return dataSource.execPrivate(null, query);
}

/**
 * Version of loadDom that returns a subset of the dom that doesn't contain sensitive information
 */
export async function loadRuntimeState(): Promise<RuntimeState> {
  return createRuntimeState({ dom: await loadDom() });
}
