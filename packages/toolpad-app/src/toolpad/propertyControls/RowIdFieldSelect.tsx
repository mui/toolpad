import { PropValueType } from '@mui/toolpad-core';
import { GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { EditorProps } from '../../types';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import SelectControl from './select';
import PropertyControl from '../../components/PropertyControl';

function ColumnSelect({ propType, nodeId, ...props }: EditorProps<string>) {
  const { bindings } = usePageEditorState();
  const columnsValue = nodeId && bindings[`${nodeId}.props.columns`];
  const definedColumns: GridColDef[] = columnsValue?.value as any;

  const newPropType: PropValueType = React.useMemo(() => {
    const columnNames = definedColumns?.map((column) => column.field);
    return { type: 'string', enum: columnNames };
  }, [definedColumns]);

  return (
    <PropertyControl propType={propType}>
      <SelectControl nodeId={nodeId} {...props} propType={newPropType} />
    </PropertyControl>
  );
}

export default ColumnSelect;
