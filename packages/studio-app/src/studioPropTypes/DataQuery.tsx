import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import type { PropTypeDefinition, EditorProps } from '../types';
import client from '../api';

function DataQueryEditor({ value, onChange }: EditorProps<string | null>) {
  const queriesQuery = useQuery('apis', client.query.getApis);

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
      {(queriesQuery.data || []).map(({ id }) => (
        <MenuItem key={id} value={id}>
          {id}
        </MenuItem>
      ))}
    </Select>
  );
}

const dataQueryType: PropTypeDefinition<string | null> = {
  Editor: DataQueryEditor,
};

export default dataQueryType;
