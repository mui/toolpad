import { ArgTypeDefinitions } from '@mui/studio-core';
import movies from './movies/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { StudioDataSourceClient } from '../types';
import * as studioDom from '@studioDom';

const studioConnections: { [key: string]: StudioDataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
  rest,
};

export function getQueryNodeArgTypes(
  dom: studioDom.StudioDom,
  node: studioDom.StudioQueryStateNode,
): ArgTypeDefinitions {
  const apiNode = node.api ? studioDom.getNode(dom, node.api, 'api') : null;
  if (!apiNode) {
    console.warn(`Can't resolve API node "${node.api}" from query "${node.id}"`);
    return {};
  }
  const dataSource = studioConnections[apiNode.connectionType];
  return dataSource?.getArgTypes?.(apiNode.query) || {};
}

export default studioConnections;
