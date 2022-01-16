import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import type { PropControlDefinition, EditorProps } from '../../types';
import * as studioDom from '../../studioDom';
import { useDom } from '../DomProvider';

function DataQueryEditor({ value, onChange }: EditorProps<string | null>) {
  const dom = useDom();
  const app = studioDom.getApp(dom);
  const apis = studioDom.getApis(dom, app);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`select-data-query`}>Query</InputLabel>
      <Select
        value={value || ''}
        labelId="select-data-query"
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
    </FormControl>
  );
}

const dataQueryType: PropControlDefinition<string | null> = {
  Editor: DataQueryEditor,
};

export default dataQueryType;
