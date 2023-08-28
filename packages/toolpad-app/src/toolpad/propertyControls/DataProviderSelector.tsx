import { PropValueType } from '@mui/toolpad-core';
import { GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { EditorProps } from '../../types';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import SelectControl from './select';
import client from '../../api';
import { Autocomplete, TextField } from '@mui/material';

function DataProviderSelector({ propType, value, onChange }: EditorProps<string>) {
  const { data: introspection, isLoading } = client.useQuery('introspect', []);

  console.log(introspection);

  const options =
    introspection?.files.flatMap((file) =>
      file.dataProviders?.map((dataProvider) => ({ file, dataProvider })),
    ) ?? [];

  const autocompleteValue = React.useMemo(() => {
    if (!value) {
      return null;
    }
    const [fileName, providerName] = value.split(':');
    console.log(fileName, providerName);
    return (
      options.find(
        (option) => option.file.name === fileName && option.dataProvider.name === providerName,
      ) ?? null
    );
  }, [value, options]);
  console.log(value, options, autocompleteValue);

  return (
    <Autocomplete
      options={options}
      groupBy={(option) => option.file.name}
      getOptionLabel={(option) => option.dataProvider.name}
      renderInput={(params) => <TextField {...params} label="Data Provider" />}
      value={autocompleteValue}
      onChange={(event, value) => {
        onChange(value ? `${value.file.name}:${value.dataProvider.name}` : undefined);
      }}
    />
  );
}

export default DataProviderSelector;
