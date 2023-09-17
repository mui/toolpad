import * as React from 'react';
import { Autocomplete, IconButton, TextField, styled, autocompleteClasses } from '@mui/material';
import { errorFrom } from '@mui/toolpad-utils/errors';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { EditorProps } from '../../types';
import client from '../../api';

const classes = {
  editButton: 'DataProviderSelector_editButton',
};

const DataProviderSelectorRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),

  [`& .${classes.editButton}`]: {
    visibility: 'hidden',
  },

  [`&:hover .${classes.editButton}, & .${autocompleteClasses.focused} .${classes.editButton}`]: {
    visibility: 'visible',
  },
}));

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
    <DataProviderSelectorRoot>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.displayName}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {value ? (
                    <IconButton className={classes.editButton}>
                      <EditIcon />
                    </IconButton>
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
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
        sx={{ flex: 1 }}
      />
      <IconButton>
        <AddIcon />
      </IconButton>
    </DataProviderSelectorRoot>
  );
}

export default DataProviderSelector;
