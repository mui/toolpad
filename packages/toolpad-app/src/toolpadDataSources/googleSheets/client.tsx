import { Stack, Button, TextField, Autocomplete } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsApiQuery,
  GoogleSheetsPrivateQueryType,
  GoogleSpreadsheet,
  GoogleSheet,
} from './types';
import useDebounced from '../../utils/useDebounced';

function getInitialQueryValue(): any {
  return null;
}

function isConnectionValid(connection: GoogleSheetsConnectionParams | null): boolean {
  if (connection?.access_token && connection?.refresh_token) {
    return true;
  }
  return false;
}

function QueryEditor({ api, value, onChange }: QueryEditorProps<GoogleSheetsApiQuery>) {
  const [spreadsheetQuery, setSpreadsheetQuery] = React.useState<string | null>(null);

  const debouncedSpreadsheetQuery = useDebounced(spreadsheetQuery, 250);

  const { isLoading: isListLoading, data: listData } = useQuery(
    ['fetchSpreadsheets', debouncedSpreadsheetQuery],
    () => {
      return api.fetchPrivate({
        type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEETS,
        inputString: debouncedSpreadsheetQuery,
      });
    },
    {
      keepPreviousData: true,
    },
  );

  const handleSpreadsheetChange = React.useCallback(
    (event, newValue: string | null) => {
      onChange({
        ...value,
        sheetName: null,
        spreadsheetId: newValue ?? null,
      });
    },
    [onChange, value],
  );

  const handleSpreadsheetInput = React.useCallback(
    (event: React.SyntheticEvent, inputValue: string, reason: string) => {
      if (reason === 'input') {
        setSpreadsheetQuery(inputValue);
      }
    },
    [],
  );

  const getSpreadsheetName = (spreadsheetId: string) => {
    return (
      listData?.files?.find((spreadsheet: GoogleSpreadsheet) => spreadsheet.id === spreadsheetId)
        ?.name ?? null
    );
  };

  const { isLoading: isSpreadsheetLoading, data: spreadsheetData } = useQuery(
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

  const getSheetTitle = React.useCallback(
    (sheetId: number | null) => {
      return (
        spreadsheetData?.sheets?.find((sheet: GoogleSheet) => sheet.sheetId === sheetId)?.title ??
        null
      );
    },
    [spreadsheetData],
  );

  const getSheetId = (sheetName: string | null) => {
    return (
      spreadsheetData?.sheets?.find((sheet: GoogleSheet) => sheet.title === sheetName)?.sheetId ??
      null
    );
  };

  const handleSheetChange = React.useCallback(
    (event, newValue: number | null) => {
      onChange({
        ...value,
        sheetName: getSheetTitle(newValue) ?? null,
      });
    },
    [getSheetTitle, onChange, value],
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

  return (
    <Stack direction="column" gap={2}>
      <Autocomplete
        size="small"
        fullWidth
        loading={isListLoading}
        defaultValue={value?.spreadsheetId}
        loadingText={'Loading...'}
        options={
          isListLoading
            ? []
            : listData?.files?.map((spreadsheet: GoogleSpreadsheet) => spreadsheet.id) ?? []
        }
        onInputChange={handleSpreadsheetInput}
        getOptionLabel={(option: string) => getSpreadsheetName(option) ?? ''}
        onChange={handleSpreadsheetChange}
        renderOption={(props, option: string) => {
          return (
            <li {...props} key={option}>
              {getSpreadsheetName(option)}
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} size="small" label="Select spreadsheet" />}
      />
      <Autocomplete
        size="small"
        fullWidth
        loading={isSpreadsheetLoading}
        defaultValue={getSheetId(value?.sheetName)}
        loadingText={'Loading...'}
        options={
          isSpreadsheetLoading
            ? []
            : spreadsheetData.sheets?.map((sheet: GoogleSheet) => sheet.sheetId)
        }
        getOptionLabel={(option: number) => getSheetTitle(option)}
        onChange={handleSheetChange}
        renderOption={(props, option: number) => {
          return (
            <li {...props} key={option}>
              {getSheetTitle(option)}
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} size="small" label="Select sheet" />}
      />
      <TextField
        size="small"
        label="Range"
        helperText={`In the form of A1:Z999`}
        defaultValue={value?.ranges ?? 'A1:Z10'}
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
  getInitialConnectionValue: getInitialQueryValue,
  isConnectionValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
