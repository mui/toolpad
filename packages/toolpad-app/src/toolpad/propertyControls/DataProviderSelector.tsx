import * as React from 'react';
import {
  Autocomplete,
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
import AddIcon from '@mui/icons-material/Add';
import { useMutation } from '@tanstack/react-query';
import { LoadingButton } from '@mui/lab';
import { EditorProps } from '../../types';
import client from '../../api';
import type {
  DataProviderIntrospectionResult,
  FileIntrospectionResult,
} from '../../server/functionsTypesWorker';
import { projectEvents } from '../../projectEvents';
import OpenCodeEditorButton from '../../components/OpenCodeEditor';

projectEvents.on('functionsChanged', () => client.invalidateQueries('introspect', []));

function useFunctionsIntrospectQuery() {
  return client.useQuery('introspect', []);
}

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
  onCommit: (newName: string) => void;
  existingNames: Set<string>;
  initialName: string;
}

function CreateNewDataProviderDialog({
  open,
  onClose,
  onCommit,
  existingNames,
  initialName,
}: CreateNewDataProviderDialogProps) {
  const [newName, setNewName] = React.useState(initialName);
  React.useEffect(() => {
    if (open) {
      setNewName(initialName);
    }
  }, [open, initialName]);

  const createProviderMutation = useMutation({
    mutationKey: [newName],
    mutationFn: () => client.mutation.createDataProvider(newName),
    onSuccess: () => {
      onCommit(newName);
      onClose();
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProviderMutation.mutate();
  };

  const nameExists = existingNames.has(newName);

  const errorMessage = React.useMemo(() => {
    if (nameExists) {
      return `Provider "${newName}" already exists`;
    }
    if (createProviderMutation.error) {
      return errorFrom(createProviderMutation.error).message;
    }
    return null;
  }, [nameExists, createProviderMutation.error, newName]);

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
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            disabled={!newName || !!errorMessage}
            loading={createProviderMutation.isLoading}
          >
            Add
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function getProviderNameFromFile(file: FileIntrospectionResult): string {
  return file.name.replace(/\.[^.]+$/, '');
}

function DataProviderSelector({ value, onChange }: EditorProps<string>) {
  const { data: introspection, isLoading, error } = useFunctionsIntrospectQuery();

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

  const [fileName = null, providerName = null] = value ? value.split(':') : [];

  const autocompleteValue = React.useMemo(() => {
    return (
      options.find(
        (option) =>
          option.kind === 'option' &&
          option.file.name === fileName &&
          option.dataProvider.name === providerName,
      ) ?? null
    );
  }, [fileName, providerName, options]);

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
        onCommit={(newName) => onChange(`${newName}.ts:default`)}
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
                  {fileName ? (
                    <OpenCodeEditorButton
                      className={classes.editButton}
                      filePath={fileName}
                      fileType="resource"
                      iconButton
                    />
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
