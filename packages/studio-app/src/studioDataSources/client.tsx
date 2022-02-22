import { ArgTypeDefinitions } from '@mui/studio-core';
import movies from './movies/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { StudioDataSourceClient } from '../types';
import * as studioDom from '../studioDom';

const studioConnections: { [key: string]: StudioDataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
  rest,
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
  const dataSource = studioConnections[apiNode.attributes.connectionType.value];
  return dataSource?.getArgTypes?.(apiNode.attributes.query.value) || {};
}

export default studioConnections;
