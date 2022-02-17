import { Stack, Button, TextField } from '@mui/material';
import * as React from 'react';
import { StudioDataSourceClient, StudioConnectionParamsEditorProps } from 'src/types';
import { WithControlledProp } from 'src/utils/types';
import { GoogleSheetsConnectionParams, GoogleSheetsQuery } from './types';

function getInitialQueryValue(): any {
  return null;
}

function isValid(connection: GoogleSheetsConnectionParams): boolean {
  if (connection?.access_token && connection?.expiry_date) {
    if (connection?.expiry_date >= Date.now()) return true;
  }
  return false;
}

function getSpreadsheetId(url: string): string | undefined {
  let match = new RegExp('([a-zA-Z0-9-_]{15,})').exec(url)?.[0];
  return match;
}

function QueryEditor({ onChange }: WithControlledProp<GoogleSheetsQuery>) {
  const handleUrlChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        spreadsheetId: getSpreadsheetId(event.target.value) || '',
      });
    },
    [onChange],
  );
  return (
    <Stack direction="column" gap={2}>
      <TextField size="small" label="Spreadsheet URL" onChange={handleUrlChange} />
    </Stack>
  );
}

function ConnectionParamsInput({
  connectionId,
  value,
}: StudioConnectionParamsEditorProps<GoogleSheetsConnectionParams>) {
  //TODO: Refresh access_token if expired
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        disabled={isValid(value)}
        href={`/api/dataSources/googleSheets?state=${connectionId}`}
        variant="outlined"
      >
        {isValid(value) ? 'Signed In' : 'Sign In to Google '}
      </Button>
    </Stack>
  );
}

const dataSource: StudioDataSourceClient<GoogleSheetsConnectionParams, GoogleSheetsQuery> = {
  displayName: 'Google Sheets',
  ConnectionParamsInput,
  getInitialConnectionValue: () => null,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
