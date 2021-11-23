import * as React from 'react';
import { StudioNode } from '../../types';

const NodeContext = React.createContext<StudioNode | null>(null);

export default NodeContext;
