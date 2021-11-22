import * as React from 'react';
import { NodeId, PropTypeDefinition } from '../types';

const Node: PropTypeDefinition<NodeId> = {
  Editor: () => <React.Fragment />,
};

export default Node;
