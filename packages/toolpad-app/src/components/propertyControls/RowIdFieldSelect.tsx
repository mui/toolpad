import { ArgTypeDefinition } from '@mui/toolpad-core';
import { GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { EditorProps } from '../../types';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import select from './select';

function ColumnSelect({ nodeId, argType, ...props }: EditorProps<string>) {
  const { viewState } = usePageEditorState();
  const definedColumns = viewState.nodes[nodeId]?.props.columns as GridColDef[];

  const newArgType: ArgTypeDefinition = React.useMemo(() => {
    const columnNames = definedColumns.map((column) => column.field);
    return {
      ...argType,
      typeDef: { type: 'string', enum: columnNames },
    };
  }, [argType, definedColumns]);
  return <select.Editor nodeId={nodeId} argType={newArgType} {...props} />;
}

export default {
  Editor: ColumnSelect,
};
