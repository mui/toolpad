import * as React from 'react';
import type { NodeId, PropTypeDefinition } from '../types';

const Node: PropTypeDefinition<NodeId> = {
  Editor: () => <React.Fragment />,
};

export default Node;
