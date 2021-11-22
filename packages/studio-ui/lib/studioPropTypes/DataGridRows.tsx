import * as React from 'react';
import type { PropTypeDefinition } from '../types';

const DataGridColumns: PropTypeDefinition<string[]> = {
  Editor: () => <React.Fragment>Rows</React.Fragment>,
};

export default DataGridColumns;
