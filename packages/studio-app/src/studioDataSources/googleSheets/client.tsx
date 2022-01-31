import { Stack, TextareaAutosize, Button } from '@mui/material';
import * as React from 'react';
import { StudioDataSourceClient } from '../../types';
import { useInput } from '../../utils/forms';
import config from '../../config';
import { WithControlledProp } from '../../utils/types';
import { GoogleSheetsConnectionParams, PostgresQuery } from './types';

function getInitialValue(): GoogleSheetsConnectionParams {
  return {
    clientId: config.googleSheetsClientId,
  };
}

function isValid(connection: GoogleSheetsConnectionParams): boolean {
  return !!connection.clientId;
}

function initiateGoogleSheetsConnection(connection: GoogleSheetsConnectionParams) {
  return null;
}

function ConnectionParamsInput({
  value,
  onChange,
}: WithControlledProp<GoogleSheetsConnectionParams>) {
  return (
    <Stack direction="column" gap={1}>
      <Button variant="outlined">Sign In to Google Sheets</Button>
    </Stack>
  );
}

function QueryEditor({ value, onChange }: WithControlledProp<PostgresQuery>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...value, text: event.target.value });
    },
    [value, onChange],
  );
  return (
    <div>
      <TextareaAutosize
        maxRows={4}
        value={value.text}
        onChange={handleChange}
        style={{ width: 200 }}
      />
    </div>
  );
}

function getInitialQueryValue(): PostgresQuery {
  return {
    text: '',
    params: [],
  };
}

const dataSource: StudioDataSourceClient<GoogleSheetsConnectionParams, PostgresQuery> = {
  displayName: 'Google Sheets',
  needsConnection: true,
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialValue,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
