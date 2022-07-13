import {
  Stack,
  Button,
  Checkbox,
  TextField,
  Autocomplete,
  FormControlLabel,
  Typography,
  Skeleton,
} from '@mui/material';
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
  GoogleDriveUser,
} from './types';
import useDebounced from '../../utils/useDebounced';
import { usePrivateQuery } from '../context';

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
  value,
  onChange,
}: QueryEditorProps<GoogleSheetsConnectionParams, GoogleSheetsApiQuery>) {
  const [spreadsheetQuery, setSpreadsheetQuery] = React.useState<string | null>(null);

  const debouncedSpreadsheetQuery = useDebounced(spreadsheetQuery, 300);

  const fetchedFiles: UseQueryResult<GoogleDriveFiles> = usePrivateQuery({
    type: GoogleSheetsPrivateQueryType.FILES_LIST,
    spreadsheetQuery: debouncedSpreadsheetQuery,
  });

  const fetchedFile: UseQueryResult<GoogleDriveFile> = usePrivateQuery(
    value.query.spreadsheetId
      ? {
          type: GoogleSheetsPrivateQueryType.FILE_GET,
          spreadsheetId: value.query.spreadsheetId,
        }
      : null,
  );

  const fetchedSpreadsheet: UseQueryResult<GoogleSpreadsheet> = usePrivateQuery(
    value.query.spreadsheetId
      ? {
          type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEET,
          spreadsheetId: value.query.spreadsheetId,
        }
      : null,
  );

  const selectedSheet = React.useMemo(
    () =>
      fetchedSpreadsheet.data?.sheets?.find(
        (sheet) => sheet.properties?.title === value.query.sheetName,
      ) ?? null,
    [fetchedSpreadsheet, value],
  );

  const handleSpreadsheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleDriveFile | null) => {
      const query: GoogleSheetsApiQuery = {
        ...value.query,
        sheetName: null,
        spreadsheetId: newValue?.id ?? null,
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

  const handleSheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleSheet | null) => {
      const query: GoogleSheetsApiQuery = {
        ...value.query,
        sheetName: newValue?.properties?.title ?? null,
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

  const handleRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query: GoogleSheetsApiQuery = {
        ...value.query,
        ranges: event.target.value,
      };
      onChange({ ...value, query });
    },
    [onChange, value],
  );

  const handleTransformChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query: GoogleSheetsApiQuery = {
        ...value.query,
        headerRow: event.target.checked,
      };
      onChange({ ...value, query });
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
    <Stack direction="column" gap={2} sx={{ px: 3, pt: 1 }}>
      <Autocomplete
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
        renderInput={(params) => <TextField {...params} label="Select spreadsheet" />}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          );
        }}
      />
      <Autocomplete
        fullWidth
        loading={fetchedSpreadsheet.isLoading}
        value={selectedSheet}
        loadingText={'Loading...'}
        options={fetchedSpreadsheet.data?.sheets ?? []}
        getOptionLabel={(option: GoogleSheet) => option.properties?.title ?? ''}
        onChange={handleSheetChange}
        renderInput={(params) => <TextField {...params} label="Select sheet" />}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option?.properties?.sheetId}>
              {option?.properties?.title}
            </li>
          );
        }}
      />
      <TextField
        label="Range"
        helperText={`In the form of A1:Z999`}
        value={value.query.ranges}
        disabled={!value.query.sheetName}
        onChange={handleRangeChange}
      />
      <FormControlLabel
        label="First row contains column headers"
        control={
          <Checkbox
            checked={value.query.headerRow}
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
}: ConnectionEditorProps<GoogleSheetsConnectionParams>) {
  const validatedUser: UseQueryResult<GoogleDriveUser> = usePrivateQuery(
    {
      type: GoogleSheetsPrivateQueryType.CONNECTION_STATUS,
    },
    { retry: false },
  );
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        disabled={Boolean(validatedUser.data)}
        href={`${handlerBasePath}/auth/login?state=${encodeURIComponent(
          JSON.stringify({ appId, connectionId }),
        )}
        `}
        variant="outlined"
      >
        <Typography variant="button">
          {validatedUser.isLoading ? (
            <Skeleton width={100} />
          ) : (
            `Connect${validatedUser.data ? `ed: ${validatedUser.data.emailAddress}` : ''}`
          )}
        </Typography>
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
