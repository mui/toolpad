import { Stack, Button, Checkbox, TextField, Autocomplete, FormControlLabel } from '@mui/material';
import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsApiQuery,
  GoogleSheetsPrivateQueryType,
  GoogleDriveFile,
  GoogleSpreadsheet,
  GoogleSheet,
  GoogleDriveFiles,
} from './types';
import useDebounced from '../../utils/useDebounced';
import client from '../../api';

function getInitialQueryValue(): GoogleSheetsApiQuery {
  return { ranges: 'A1:Z10', spreadsheetId: '', sheetName: '', headerRow: false };
}

function isConnectionValid(connection: GoogleSheetsConnectionParams | null): boolean {
  if (connection?.access_token && connection?.refresh_token) {
    return true;
  }
  return false;
}

function QueryEditor({
  appId,
  connectionId,
  value,
  onChange,
}: QueryEditorProps<GoogleSheetsApiQuery>) {
  const [spreadsheetQuery, setSpreadsheetQuery] = React.useState<string | null>(null);

  const debouncedSpreadsheetQuery = useDebounced(spreadsheetQuery, 300);

  const fetchedFiles: UseQueryResult<GoogleDriveFiles> = client.useQuery('dataSourceFetchPrivate', [
    appId,
    connectionId,
    {
      type: GoogleSheetsPrivateQueryType.FILES_LIST,
      spreadsheetQuery: debouncedSpreadsheetQuery,
    },
  ]);

  const fetchedFile: UseQueryResult<GoogleDriveFile> = client.useQuery(
    'dataSourceFetchPrivate',
    value.spreadsheetId
      ? [
          appId,
          connectionId,
          {
            type: GoogleSheetsPrivateQueryType.FILE_GET,
            spreadsheetId: value.spreadsheetId,
          },
        ]
      : null,
  );

  const fetchedSpreadsheet: UseQueryResult<GoogleSpreadsheet> = client.useQuery(
    'dataSourceFetchPrivate',
    value.spreadsheetId
      ? [
          appId,
          connectionId,
          {
            type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEET,
            spreadsheetId: value.spreadsheetId,
          },
        ]
      : null,
  );

  const selectedSheet = React.useMemo(
    () =>
      fetchedSpreadsheet.data?.sheets?.find(
        (sheet) => sheet.properties?.title === value.sheetName,
      ) ?? null,
    [fetchedSpreadsheet, value],
  );

  const handleSpreadsheetChange = React.useCallback(
    (event, newValue: GoogleDriveFile | null) => {
      onChange({
        ...value,
        sheetName: null,
        spreadsheetId: newValue?.id ?? null,
      });
    },
    [onChange, value],
  );

  const handleSheetChange = React.useCallback(
    (event, newValue: GoogleSheet | null) => {
      onChange({
        ...value,
        sheetName: newValue?.properties?.title ?? null,
      });
    },
    [onChange, value],
  );

  const handleRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        ranges: event.target.value,
      });
    },
    [onChange, value],
  );

  const handleTransformChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        headerRow: event.target.checked,
      });
    },
    [onChange, value],
  );

  const handleSpreadsheetInput = React.useCallback(
    (event: React.SyntheticEvent, input: string, reason: string) => {
      if (reason === 'input') {
        setSpreadsheetQuery(input);
      }
    },
    [],
  );

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        fullWidth
        value={fetchedFile.data ?? null}
        loading={fetchedFiles.isLoading}
        loadingText={'Loading...'}
        options={fetchedFiles.data?.files ?? []}
        getOptionLabel={(option: GoogleDriveFile) => option.name ?? ''}
        onInputChange={handleSpreadsheetInput}
        onChange={handleSpreadsheetChange}
        isOptionEqualToValue={(option: GoogleDriveFile, val: GoogleDriveFile) =>
          option.id === val.id
        }
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          );
        }}
      />
      <Autocomplete
        size="small"
        fullWidth
        loading={fetchedSpreadsheet.isLoading}
        value={selectedSheet}
        loadingText={'Loading...'}
        options={fetchedSpreadsheet.data?.sheets ?? []}
        getOptionLabel={(option: GoogleSheet) => option.properties?.title ?? ''}
        onChange={handleSheetChange}
        renderInput={(params) => <TextField {...params} size="small" label="Select sheet" />}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option?.properties?.sheetId}>
              {option?.properties?.title}
            </li>
          );
        }}
      />
      <TextField
        size="small"
        label="Range"
        helperText={`In the form of A1:Z999`}
        value={value.ranges}
        disabled={!value.sheetName}
        onChange={handleRangeChange}
      />
      <FormControlLabel
        label="Interpret first row as columns"
        control={
          <Checkbox
            size="small"
            checked={value.headerRow}
            onChange={handleTransformChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
      />
    </Stack>
  );
}

function ConnectionParamsInput({
  appId,
  connectionId,
  handlerBasePath,
  value,
}: ConnectionEditorProps<GoogleSheetsConnectionParams>) {
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        disabled={isConnectionValid(value)}
        href={`${handlerBasePath}/auth/login?state=${encodeURIComponent(
          JSON.stringify({ appId, connectionId }),
        )}
        `}
        variant="outlined"
      >
        {isConnectionValid(value) ? 'Signed In' : 'Sign In to Google '}
      </Button>
    </Stack>
  );
}

const dataSource: ClientDataSource<GoogleSheetsConnectionParams, GoogleSheetsApiQuery> = {
  displayName: 'Google Sheets',
  ConnectionParamsInput,
  isConnectionValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
