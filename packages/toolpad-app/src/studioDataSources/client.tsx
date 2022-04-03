import { ArgTypeDefinitions } from '@mui/toolpad-core';
import movies from './movies/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { NodeId, DataSourceClient } from '../types';
import * as appDom from '../appDom';
import googleSheets from './googleSheets/client';

const studioConnections: { [key: string]: DataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
  rest,
  googleSheets,
};

export function getQueryNodeArgTypes(
  dom: appDom.AppDom,
  node: appDom.QueryStateNode,
): ArgTypeDefinitions {
  const apiNodeId = node.attributes.api.value;
  if (!apiNodeId) {
    return {};
  }
  const apiNode = apiNodeId ? appDom.getNode(dom, apiNodeId, 'api') : null;
  if (!apiNode) {
    console.warn(`Can't resolve API node "${apiNodeId}" from query "${node.id}"`);
    return {};
  }
  const connectionNodeId = apiNode.attributes.connectionId.value as NodeId;
  const connectionNode = appDom.getNode(dom, connectionNodeId, 'connection');
  const dataSource = studioConnections[connectionNode.attributes.dataSource.value];
  return dataSource?.getArgTypes?.(apiNode.attributes.query.value) || {};
}

export default studioConnections;
