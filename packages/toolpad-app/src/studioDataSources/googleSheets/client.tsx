import { Stack, Button, TextField, Autocomplete } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import {
  StudioDataSourceClient,
  StudioConnectionEditorProps,
  StudioQueryEditorProps,
} from '../../types';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsApiQuery,
  GoogleSheetsPrivateQueryType,
  GoogleSheetsPrivateQuery,
  GoogleSpreadsheet,
  GoogleSheet,
} from './types';

function getInitialQueryValue(): any {
  return null;
}

function isConnectionValid(connection: GoogleSheetsConnectionParams | null): boolean {
  if (connection?.access_token && connection?.expiry_date && connection?.refresh_token) {
    if (connection.expiry_date >= Date.now()) {
      return true;
    }
  }
  return false;
}

function QueryEditor({
  api,
  value,
  onChange,
}: StudioQueryEditorProps<GoogleSheetsApiQuery, GoogleSheetsPrivateQuery>) {
  // const [apiQuery, dispatch] = React.useReducer(queryEditorReducer, value);

  const {
    isIdle: isListPending,
    isLoading: isListLoading,
    data: listData,
  } = useQuery('fetchSpreadsheets', () => {
    return api.fetchPrivate({ type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEETS });
  });

  const handleSpreadsheetChange = React.useCallback(
    (event, newValue: GoogleSpreadsheet | null) => {
      onChange({
        ...value,
        spreadsheetId: newValue?.id ?? null,
      });
    },
    [onChange, value],
  );

  const handleSheetChange = React.useCallback(
    (event, newValue: GoogleSheet | null) => {
      onChange({
        ...value,
        sheetName: newValue?.title ?? null,
      });
    },
    [onChange, value],
  );

  const handleRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        ranges: event.target?.value,
      });
    },
    [onChange, value],
  );

  const {
    isIdle: isSpreadsheetPending,
    isLoading: isSpreadsheetLoading,
    data: spreadsheetData,
  } = useQuery(
    ['fetchSheet', value?.spreadsheetId],
    () => {
      return api.fetchPrivate({
        type: GoogleSheetsPrivateQueryType.FETCH_SHEET,
        spreadsheetId: value?.spreadsheetId,
      });
    },
    {
      enabled: Boolean(value?.spreadsheetId),
    },
  );

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        fullWidth
        value={
          !isListLoading && value?.spreadsheetId
            ? listData.files.find(
                (spreadsheet: GoogleSpreadsheet) => spreadsheet.id === value.spreadsheetId,
              )
            : null
        }
        loading={isListLoading}
        loadingText={'Loading...'}
        options={isListLoading || isListPending ? [] : listData.files ?? []}
        getOptionLabel={(option: GoogleSpreadsheet) => option.name}
        onChange={handleSpreadsheetChange}
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
      />
      <Autocomplete
        size="small"
        value={
          !isSpreadsheetLoading && value?.sheetName
            ? spreadsheetData.sheets.find((sheet: GoogleSheet) => sheet.title === value.sheetName)
            : null
        }
        fullWidth
        loading={isSpreadsheetLoading}
        loadingText={'Loading...'}
        options={isSpreadsheetLoading || isSpreadsheetPending ? [] : spreadsheetData.sheets}
        getOptionLabel={(option: GoogleSheet) => option.title}
        isOptionEqualToValue={(option: GoogleSheet, newValue: GoogleSheet | null) =>
          option.sheetId === newValue?.sheetId
        }
        onChange={handleSheetChange}
        renderInput={(params) => <TextField {...params} size="small" label="Select sheet" />}
      />
      <TextField
        size="small"
        label="Range"
        helperText={`In the form of A1:Z999`}
        defaultValue={value?.ranges ?? 'A1:Z100'}
        disabled={!value?.sheetName}
        onChange={handleRangeChange}
      />
    </Stack>
  );
}

function ConnectionParamsInput({
  appId,
  connectionId,
  handlerBasePath,
  value,
}: StudioConnectionEditorProps<GoogleSheetsConnectionParams>) {
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

const dataSource: StudioDataSourceClient<GoogleSheetsConnectionParams, GoogleSheetsApiQuery> = {
  displayName: 'Google Sheets',
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialQueryValue,
  isConnectionValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
