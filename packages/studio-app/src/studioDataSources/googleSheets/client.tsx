import { Stack, Button } from '@mui/material';
import * as React from 'react';
import { StudioDataSourceClient } from '../../types';
import { StudioConnectionParamsEditorProps } from 'src/types';
import { GoogleSheetsConnectionParams } from './types';

function getInitialValue(): GoogleSheetsConnectionParams {
  return {};
}

function isValid(connection: GoogleSheetsConnectionParams): boolean {
  return true;
}

function ConnectionParamsInput({
  connectionName,
}: StudioConnectionParamsEditorProps<GoogleSheetsConnectionParams>) {
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        href={`/api/dataSources/googleSheets?name=${connectionName}`}
        variant="outlined"
      >
        Sign in to Google
      </Button>
    </Stack>
  );
}

const dataSource: StudioDataSourceClient<GoogleSheetsConnectionParams> = {
  displayName: 'Google Sheets',
  needsConnection: true,
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialValue,
  isConnectionValid: isValid,
};

export default dataSource;
