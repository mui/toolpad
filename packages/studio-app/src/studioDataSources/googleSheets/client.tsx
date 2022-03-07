import { Stack, Button, TextField, Autocomplete } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import { StudioDataSourceClient, StudioConnectionEditorProps } from '../../types';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsQuery,
  GoogleSpreadsheet,
  GoogleSheet,
  GoogleSheetsQueryAction,
  GoogleSheetsActionKind,
} from './types';

function getInitialQueryValue(): any {
  return null;
}

function isValid(connection: GoogleSheetsConnectionParams): boolean {
  if (connection?.access_token && connection?.expiry_date) {
    if (connection?.expiry_date >= Date.now()) {
      return true;
    }
  }
  return false;
}

const queryReducer = (
  state: GoogleSheetsQuery,
  action: GoogleSheetsQueryAction,
): GoogleSheetsQuery => {
  const { type, payload } = action;
  switch (type) {
    case GoogleSheetsActionKind.UPDATE_SPREADSHEET:
      return {
        ...state,
        sheet: null,
        spreadsheet: payload as GoogleSpreadsheet,
      };
    case GoogleSheetsActionKind.UPDATE_SHEET:
      return {
        ...state,
        sheet: payload as GoogleSheet,
      };
    case GoogleSheetsActionKind.UPDATE_RANGE:
      return {
        ...state,
        ranges: payload as GoogleSpreadsheet['range'],
      };
    default:
      return state;
  }
};

function QueryEditor({
  value,
  onChange,
  connectionId,
}: StudioConnectionEditorProps<GoogleSheetsQuery>) {
  const {
    isIdle: isListPending,
    isLoading: isListLoading,
    data: listData,
    refetch: fetchSpreadsheets,
  } = useQuery(
    'fetchSpreadsheets',
    async () => {
      const response = await fetch(`/api/dataSources/googleSheets/data?state=${connectionId}`);
      if (!response.ok) {
        throw new Error(`Unable to fetch spreadsheets for connection ${connectionId}`);
      }
      return response.json();
    },
    { enabled: false },
  );

  React.useEffect(() => {
    fetchSpreadsheets();
  }, [fetchSpreadsheets]);

  const [query, dispatch] = React.useReducer(queryReducer, value ?? null);

  const {
    data: spreadsheetData,
    isIdle: isSpreadsheetPending,
    isLoading: isSpreadsheetLoading,
  } = useQuery(
    ['fetchSheet', query.spreadsheet?.id],
    async () => {
      const response = await fetch(
        `/api/dataSources/googleSheets/data/spreadsheet/${query.spreadsheet?.id}?state=${connectionId}`,
      );
      if (!response.ok) {
        throw new Error(
          `Unable to fetch spreadsheet ${query.spreadsheet?.id} for connection ${connectionId}`,
        );
      }
      return response.json();
    },
    {
      enabled: Boolean(query.spreadsheet),
    },
  );

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        value={query.spreadsheet}
        fullWidth
        loading={isListLoading}
        loadingText={'Loading...'}
        options={isListLoading || isListPending ? [] : listData.files}
        getOptionLabel={(option: GoogleSpreadsheet) => option.name ?? ''}
        isOptionEqualToValue={(option: GoogleSpreadsheet, val: GoogleSpreadsheet) =>
          option.id === val.id
        }
        onChange={(event: any, newValue: GoogleSpreadsheet | null) =>
          dispatch({ type: GoogleSheetsActionKind.UPDATE_SPREADSHEET, payload: newValue })
        }
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
      />
      <Autocomplete
        size="small"
        disabled={Boolean(!query.spreadsheet)}
        value={query.sheet}
        fullWidth
        loading={isSpreadsheetLoading}
        loadingText={'Loading...'}
        options={isSpreadsheetLoading || isSpreadsheetPending ? [] : spreadsheetData.sheets}
        getOptionLabel={(option: GoogleSheet) => option.title ?? ''}
        isOptionEqualToValue={(option: GoogleSheet, val: GoogleSheet) =>
          option.sheetId === val.sheetId
        }
        onChange={(event: any, newValue: GoogleSheet | null) =>
          dispatch({ type: GoogleSheetsActionKind.UPDATE_SHEET, payload: newValue })
        }
        renderInput={(params) => <TextField {...params} size="small" label="Select sheet" />}
      />
      <TextField
        size="small"
        label="Range"
        disabled={Boolean(!query.sheet)}
        helperText={`In the form of A1:B999`}
        defaultValue={value.ranges ?? `A1:Z1000`}
        onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
          await dispatch({
            type: GoogleSheetsActionKind.UPDATE_RANGE,
            payload: event?.target.value,
          });
          onChange(query);
        }}
      />
    </Stack>
  );
}

// Debounce the string parameter of this function which is what useQuery caches on

function ConnectionParamsInput({
  connectionId,
  value,
}: StudioConnectionEditorProps<GoogleSheetsConnectionParams>) {
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        disabled={isValid(value)}
        href={`/api/dataSources/googleSheets/auth/login?state=${connectionId}`}
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
  getInitialConnectionValue: getInitialQueryValue,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
