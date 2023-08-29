import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { EditorProps } from '../../types';
import client from '../../api';

function DataProviderSelector({ value, onChange }: EditorProps<string>) {
  const { data: introspection, isLoading, error } = client.useQuery('introspect', []);

  const options = React.useMemo(() => {
    return (
      introspection?.files.flatMap((file) =>
        file.dataProviders
          ?.filter((dataProvider) => dataProvider.name === 'default')
          .map((dataProvider) => ({
            file,
            dataProvider,
            displayName: file.name.replace(/\.[^.]+$/, ''),
          })),
      ) ?? []
    );
  }, [introspection]);

  const autocompleteValue = React.useMemo(() => {
    if (!value) {
      return null;
    }
    const [fileName, providerName] = value.split(':');
    return (
      options.find(
        (option) => option.file.name === fileName && option.dataProvider.name === providerName,
      ) ?? null
    );
  }, [value, options]);

  const errorMessage = error ? errorFrom(error).message : undefined;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.displayName}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Data Provider"
          error={!!errorMessage}
          helperText={errorMessage}
        />
      )}
      value={autocompleteValue}
      loading={isLoading}
      onChange={(event, newValue) => {
        onChange(newValue ? `${newValue.file.name}:${newValue.dataProvider.name}` : undefined);
      }}
    />
  );
}

export default DataProviderSelector;
