import { Stack, Button, TextField, Autocomplete, Typography } from '@mui/material';
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
  if (connection?.access_token && connection?.expiry_date) {
    if (connection.expiry_date >= Date.now()) {
      return true;
    }
  }
  return false;
}

enum QueryEditorActionType {
  UPDATE_SPREADSHEET = 'UPDATE_SPREADSHEET',
  UPDATE_SHEET = 'UPDATE_SHEET',
  UPDATE_RANGE = 'UPDATE_RANGE',
}

type QueryEditorAction =
  | {
      type: QueryEditorActionType.UPDATE_SPREADSHEET;
      spreadsheetId: GoogleSheetsApiQuery['spreadsheetId'];
    }
  | {
      type: QueryEditorActionType.UPDATE_SHEET;
      sheetName: GoogleSheetsApiQuery['sheetName'];
    }
  | {
      type: QueryEditorActionType.UPDATE_RANGE;
      ranges: GoogleSheetsApiQuery['ranges'];
    };

function queryEditorReducer(
  state: GoogleSheetsApiQuery,
  action: QueryEditorAction,
): GoogleSheetsApiQuery {
  switch (action.type) {
    case QueryEditorActionType.UPDATE_SPREADSHEET:
      return {
        ...state,
        spreadsheetId: action.spreadsheetId,
      };
    case QueryEditorActionType.UPDATE_SHEET:
      return {
        ...state,
        sheetName: action.sheetName,
      };
    case QueryEditorActionType.UPDATE_RANGE:
      return {
        ...state,
        ranges: action.ranges,
      };
      return state;
    default:
      throw new Error();
  }
}

function QueryEditor({
  api,
  value,
  onChange,
}: StudioQueryEditorProps<GoogleSheetsApiQuery, GoogleSheetsPrivateQuery>) {
  const [apiQuery, dispatch] = React.useReducer(queryEditorReducer, value);

  const {
    isIdle: isListPending,
    isLoading: isListLoading,
    data: listData,
  } = useQuery('fetchSpreadsheets', () => {
    return api.fetchPrivate({ type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEETS });
  });

  const {
    isIdle: isSpreadsheetPending,
    isLoading: isSpreadsheetLoading,
    data: spreadsheetData,
  } = useQuery(['fetchSheet', apiQuery.spreadsheetId], () => {
    return api.fetchPrivate({
      type: GoogleSheetsPrivateQueryType.FETCH_SHEET,
      spreadsheetId: apiQuery.spreadsheetId,
    });
  });

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        fullWidth
        value={
          !isListLoading &&
          listData.files.find(
            (spreadsheet: GoogleSpreadsheet) => spreadsheet.id === apiQuery.spreadsheetId,
          )
        }
        loading={isListLoading}
        loadingText={'Loading...'}
        options={isListLoading || isListPending ? [] : listData.files ?? []}
        getOptionLabel={(option: GoogleSpreadsheet) => option.name}
        onChange={(event: any, newValue: GoogleSpreadsheet | null) =>
          dispatch({
            type: QueryEditorActionType.UPDATE_SPREADSHEET,
            spreadsheetId: newValue?.id ?? null,
          })
        }
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
      />
      <Autocomplete
        size="small"
        value={
          !isSpreadsheetLoading &&
          spreadsheetData.sheets.find((sheet: GoogleSheet) => sheet.title === apiQuery.sheetName)
        }
        fullWidth
        loading={isSpreadsheetLoading}
        loadingText={'Loading...'}
        options={isSpreadsheetLoading || isSpreadsheetPending ? [] : spreadsheetData.sheets}
        getOptionLabel={(option: GoogleSheet) => option.title}
        isOptionEqualToValue={(option: GoogleSheet, newValue: GoogleSheet | null) =>
          option.sheetId === newValue?.sheetId
        }
        onChange={(event: any, newValue: GoogleSheet | null) => {
          const { spreadsheetId, ranges } = apiQuery;
          dispatch({
            type: QueryEditorActionType.UPDATE_SHEET,
            sheetName: newValue?.title ?? null,
          });
          onChange({
            spreadsheetId,
            sheetName: newValue?.title ?? null,
            ranges,
          });
        }}
        renderInput={(params) => <TextField {...params} size="small" label="Select sheet" />}
      />
      <TextField
        size="small"
        label="Range"
        helperText={`In the form of A1:Z999`}
        defaultValue={value?.ranges ?? 'A1:Z100'}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const { spreadsheetId, sheetName } = apiQuery;
          dispatch({
            type: QueryEditorActionType.UPDATE_RANGE,
            ranges: event.target?.value,
          });
          onChange({
            spreadsheetId,
            sheetName,
            ranges: event.target?.value,
          });
        }}
      />
      <Typography>{JSON.stringify(apiQuery.sheetName)}</Typography>
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
