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
    case GoogleSheetsActionKind.FETCH_SHEET:
      return {
        ...state,
        sheet: null,
        type,
        spreadsheet: payload as GoogleSpreadsheet,
      };
    case GoogleSheetsActionKind.UPDATE_SHEET:
      return {
        ...state,
        type,
        sheet: payload as GoogleSheet,
      };
    case GoogleSheetsActionKind.UPDATE_RANGE:
      return {
        ...state,
        type,
        ranges: payload as GoogleSpreadsheet['range'],
      };
    default:
      return state;
  }
};

function QueryEditor({ value, onChange, api }: StudioQueryEditorProps<GoogleSheetsQuery>) {
  const [query, dispatch] = React.useReducer(
    queryReducer,
    value ?? {
      type: GoogleSheetsActionKind.FETCH_SPREADSHEETS,
      spreadsheet: null,
      sheet: {},
    },
  );

  const {
    isIdle: isListPending,
    isLoading: isListLoading,
    data: listData,
  } = useQuery('fetchSpreadsheets', () => {
    return api.fetchPrivate({ type: GoogleSheetsActionKind.FETCH_SPREADSHEETS });
  });

  const {
    isIdle: isSpreadsheetPending,
    isLoading: isSpreadsheetLoading,
    data: spreadsheetData,
  } = useQuery(
    ['fetchSheet', query?.spreadsheet?.id],
    () => {
      return api.fetchPrivate(query);
    },
    {
      enabled: Boolean(query?.spreadsheet) && query?.type === GoogleSheetsActionKind.FETCH_SHEET,
    },
  );

  const { isLoading: isApiDataLoading } = useQuery(
    ['execApi', query?.ranges],
    () => {
      return onChange(query);
    },
    {
      enabled: Boolean(query?.spreadsheet) && query?.type === GoogleSheetsActionKind.UPDATE_RANGE,
    },
  );

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        value={query?.spreadsheet}
        fullWidth
        loading={isListLoading}
        loadingText={'Loading...'}
        options={isListLoading || isListPending ? [] : listData.files ?? []}
        getOptionLabel={(option: GoogleSpreadsheet) => option.name ?? ''}
        isOptionEqualToValue={(option: GoogleSpreadsheet, val: GoogleSpreadsheet) =>
          option.id === val.id
        }
        onChange={(event: any, newValue: GoogleSpreadsheet | null) =>
          dispatch({ type: GoogleSheetsActionKind.FETCH_SHEET, payload: newValue })
        }
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
      />
      <Autocomplete
        size="small"
        disabled={Boolean(!query?.spreadsheet)}
        value={query?.sheet}
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
        disabled={Boolean(!query?.sheet) || isApiDataLoading}
        helperText={`In the form of A1:B999`}
        defaultValue={value?.ranges ?? `A1:Z1000`}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          dispatch({
            type: GoogleSheetsActionKind.UPDATE_RANGE,
            payload: event?.target.value,
          });
        }}
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
        disabled={isValid(value)}
        href={`${handlerBasePath}/auth/login?state=${encodeURIComponent(
          JSON.stringify({ appId, connectionId }),
        )}
        `}
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
