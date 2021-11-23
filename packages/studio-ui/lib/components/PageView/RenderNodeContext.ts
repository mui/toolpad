import * as React from 'react';
import { NodeId } from '../../types';

type RenderNode = (nodeId: NodeId) => React.ReactNode;

const RenderNodeContext = React.createContext<RenderNode>(() => null);

export default RenderNodeContext;
