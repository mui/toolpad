import * as React from 'react';
import {
  Autocomplete,
  IconButton,
  TextField,
  styled,
  autocompleteClasses,
  createFilterOptions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { errorFrom } from '@mui/toolpad-utils/errors';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { EditorProps } from '../../types';
import client from '../../api';
import type {
  DataProviderIntrospectionResult,
  FileIntrospectionResult,
} from '../../server/functionsTypesWorker';

function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.target.select();
}

type DataProviderSelectorOption =
  | {
      kind: 'option';
      file: FileIntrospectionResult;
      dataProvider: DataProviderIntrospectionResult;
      displayName: string;
    }
  | {
      kind: 'create';
      inputValue: string;
    };

const filter = createFilterOptions<DataProviderSelectorOption>();

const classes = {
  editButton: 'DataProviderSelector_editButton',
};

const DataProviderSelectorRoot = styled('div')({
  [`& .${classes.editButton}`]: {
    visibility: 'hidden',
  },

  [`&:hover .${classes.editButton}, & .${autocompleteClasses.focused} .${classes.editButton}`]: {
    visibility: 'visible',
  },
});

interface CreateNewDataProviderDialogProps {
  open: boolean;
  onClose: () => void;
  existingNames: Set<string>;
  initialName: string;
}

function CreateNewDataProviderDialog({
  open,
  onClose,
  existingNames: existingFiles,
  initialName,
}: CreateNewDataProviderDialogProps) {
  const [newName, setNewName] = React.useState(initialName);
  React.useEffect(() => {
    setNewName(initialName);
  }, [initialName]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('create ', newName);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add a new data provider</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create a new data provider please enter the name here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            label="name"
            type="text"
            onFocus={handleInputFocus}
            required
            error={existingFiles.has(newName)}
            helperText={
              existingFiles.has(newName) ? `Provider "${newName}" already exists` : undefined
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!newName || existingFiles.has(newName)}>
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function getProviderNameFromFile(file: FileIntrospectionResult): string {
  return file.name.replace(/\.[^.]+$/, '');
}

function DataProviderSelector({ value, onChange }: EditorProps<string>) {
  const { data: introspection, isLoading, error } = client.useQuery('introspect', []);

  const options = React.useMemo<DataProviderSelectorOption[]>(() => {
    return (
      introspection?.files.flatMap((file) =>
        file.dataProviders
          ?.filter((dataProvider) => dataProvider.name === 'default')
          .map((dataProvider) => ({
            kind: 'option',
            file,
            dataProvider,
            displayName: getProviderNameFromFile(file),
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
        (option) =>
          option.kind === 'option' &&
          option.file.name === fileName &&
          option.dataProvider.name === providerName,
      ) ?? null
    );
  }, [value, options]);

  const errorMessage = error ? errorFrom(error).message : undefined;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleClose = () => {
    setDialogOpen(false);
  };
  const [dialogValue, setDialogValue] = React.useState('');

  const existingNames = React.useMemo(
    () => new Set(introspection?.files.map((file) => getProviderNameFromFile(file))),
    [introspection],
  );

  return (
    <DataProviderSelectorRoot>
      <CreateNewDataProviderDialog
        open={dialogOpen}
        onClose={handleClose}
        initialName={dialogValue}
        existingNames={existingNames}
      />

      <Autocomplete
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string' || option.kind === 'create') {
            const inputValue = typeof option === 'string' ? option : option.inputValue;
            return inputValue ? `Create data provider "${inputValue}"` : 'Create new data provider';
          }
          return option.displayName;
        }}
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
        filterOptions={(unfilteredOptions, params) => {
          const filtered = filter(unfilteredOptions, params);

          if (!existingNames.has(params.inputValue)) {
            filtered.push({
              kind: 'create',
              inputValue: params.inputValue,
            });
          }

          return filtered;
        }}
        value={autocompleteValue}
        loading={isLoading}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setDialogValue(newValue);
            setDialogOpen(true);
          } else if (newValue && newValue.kind === 'create') {
            setDialogValue(newValue.inputValue);
            setDialogOpen(true);
          } else {
            onChange(newValue ? `${newValue.file.name}:${newValue.dataProvider.name}` : undefined);
          }
        }}
        renderOption={(props, option, state, ownerState) => {
          const icon = option.kind === 'create' ? <AddIcon /> : undefined;
          return (
            <li {...props}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                {icon}
                {ownerState.getOptionLabel(option)}
              </Box>
            </li>
          );
        }}
        selectOnFocus
        clearOnBlur
        freeSolo
        sx={{ flex: 1 }}
      />
    </DataProviderSelectorRoot>
  );
}

export default DataProviderSelector;
