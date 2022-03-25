import { ArgTypeDefinitions } from '../../../toolpad-core/dist';
import movies from './movies/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { NodeId, StudioDataSourceClient } from '../types';
import * as studioDom from '../studioDom';
import googleSheets from './googleSheets/client';

const studioConnections: { [key: string]: StudioDataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
  rest,
  googleSheets,
};

export function getQueryNodeArgTypes(
  dom: studioDom.StudioDom,
  node: studioDom.StudioQueryStateNode,
): ArgTypeDefinitions {
  const apiNodeId = node.attributes.api.value;
  if (!apiNodeId) {
    return {};
  }
  const apiNode = apiNodeId ? studioDom.getNode(dom, apiNodeId, 'api') : null;
  if (!apiNode) {
    console.warn(`Can't resolve API node "${apiNodeId}" from query "${node.id}"`);
    return {};
  }
  const connectionNodeId = apiNode.attributes.connectionId.value as NodeId;
  const connectionNode = studioDom.getNode(dom, connectionNodeId, 'connection');
  const dataSource = studioConnections[connectionNode.attributes.dataSource.value];
  return dataSource?.getArgTypes?.(apiNode.attributes.query.value) || {};
}

export default studioConnections;
