import { Stack, Button, Autocomplete, TextField } from '@mui/material';
import * as React from 'react';
import { StudioDataSourceClient, StudioConnectionParamsEditorProps } from 'src/types';
import { generateRandomId } from 'src/utils/randomId';
import { GoogleSheetsConnectionParams } from './types';

function getInitialQueryValue(): any {
  return null;
}

function isValid(connection: GoogleSheetsConnectionParams): boolean {
  return true;
}

function QueryEditor() {
  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        renderInput={(params) => <TextField {...params} label="Spreadsheet" size="small" />}
        options={getInitialQueryValue()}
      />
    </Stack>
  );
}

function ConnectionParamsInput({
  connectionName,
}: StudioConnectionParamsEditorProps<GoogleSheetsConnectionParams>) {
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        href={`/api/dataSources/googleSheets?id=${generateRandomId()}&name=${connectionName}`}
        variant="outlined"
      >
        Sign in to Google
      </Button>
    </Stack>
  );
}

const dataSource: StudioDataSourceClient<GoogleSheetsConnectionParams> = {
  displayName: 'Google Sheets',
  ConnectionParamsInput,
  getInitialConnectionValue: () => null,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
