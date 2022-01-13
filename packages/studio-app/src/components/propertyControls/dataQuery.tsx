import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import type { PropControlDefinition, EditorProps } from '../../types';
import { useEditorState } from '../StoreProvider';
import * as studioDom from '../../studioDom';

function DataQueryEditor({ value, onChange }: EditorProps<string | null>) {
  const state = useEditorState();
  const app = studioDom.getApp(state.dom);
  const apis = studioDom.getApis(state.dom, app);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <Select
      value={value || ''}
      labelId="select-query"
      label="Query"
      onChange={handleSelectionChange}
      size="small"
    >
      <MenuItem value="">---</MenuItem>
      {apis.map(({ id }) => (
        <MenuItem key={id} value={id}>
          {id}
        </MenuItem>
      ))}
    </Select>
  );
}

const dataQueryType: PropControlDefinition<string | null> = {
  Editor: DataQueryEditor,
};

export default dataQueryType;
