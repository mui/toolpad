import * as React from 'react';
import { NodeId, PropTypeDefinition } from '../types';

const Slots: PropTypeDefinition<NodeId[]> = {
  Editor: () => <React.Fragment />,
};

export default Slots;
