import { PropValueType } from '@toolpad/studio-runtime';
import { GridColDef } from '@mui/x-data-grid-premium';
import * as React from 'react';
import { EditorProps } from '../../types';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import SelectControl from './select';

function ColumnSelect({ propType, nodeId, ...props }: EditorProps<string>) {
  const { bindings } = usePageEditorState();
  const { helperText } = propType;
  const columnsValue = nodeId && bindings[`${nodeId}.props.columns`];
  const definedColumns: GridColDef[] = columnsValue?.value as any;

  const newPropType: PropValueType = React.useMemo(() => {
    const columnNames = definedColumns?.map((column) => column.field);
    return { type: 'string', enum: columnNames, helperText };
  }, [helperText, definedColumns]);

  return <SelectControl nodeId={nodeId} {...props} propType={newPropType} />;
}

export default ColumnSelect;
