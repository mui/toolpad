import {
  Stack,
  Button,
  Checkbox,
  TextField,
  Autocomplete,
  FormControlLabel,
  Typography,
  Skeleton,
  Box,
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
  GoogleSheetsPrivateQuery,
  GoogleSheetsResult,
} from './types';
import useDebounced from '../../utils/useDebounced';
import { usePrivateQuery } from '../context';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import JsonView from '../../components/JsonView';
import QueryInputPanel from '../QueryInputPanel';
import SplitPane from '../../components/SplitPane';
import useQueryPreview from '../useQueryPreview';

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
  QueryEditorShell,
}: QueryEditorProps<GoogleSheetsConnectionParams, GoogleSheetsApiQuery>) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const [spreadsheetQuery, setSpreadsheetQuery] = React.useState<string | null>(null);

  const debouncedSpreadsheetQuery = useDebounced(spreadsheetQuery, 300);

  const fetchedFiles: UseQueryResult<GoogleDriveFiles> = usePrivateQuery({
    type: GoogleSheetsPrivateQueryType.FILES_LIST,
    spreadsheetQuery: debouncedSpreadsheetQuery,
  });

  const fetchedFile: UseQueryResult<GoogleDriveFile> = usePrivateQuery(
    input.query.spreadsheetId
      ? {
          type: GoogleSheetsPrivateQueryType.FILE_GET,
          spreadsheetId: input.query.spreadsheetId,
        }
      : null,
  );

  const fetchedSpreadsheet: UseQueryResult<GoogleSpreadsheet> = usePrivateQuery(
    input.query.spreadsheetId
      ? {
          type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEET,
          spreadsheetId: input.query.spreadsheetId,
        }
      : null,
  );

  const selectedSheet = React.useMemo(
    () =>
      fetchedSpreadsheet.data?.sheets?.find(
        (sheet) => sheet.properties?.title === input.query.sheetName,
      ) ?? null,
    [fetchedSpreadsheet, input],
  );

  const handleSpreadsheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleDriveFile | null) => {
      setInput((existing) => ({
        ...existing,
        query: { ...existing.query, sheetName: null, spreadsheetId: newValue?.id ?? null },
      }));
    },
    [],
  );

  const handleSheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleSheet | null) => {
      setInput((existing) => ({
        ...existing,
        query: { ...existing.query, sheetName: newValue?.properties?.title ?? null },
      }));
    },
    [],
  );

  const handleRangeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, ranges: event.target.value },
    }));
  }, []);

  const handleTransformChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, headerRow: event.target.checked },
    }));
  }, []);

  const handleSpreadsheetInput = React.useCallback(
    (event: React.SyntheticEvent, spreadshetInput: string, reason: string) => {
      if (reason === 'input') {
        setSpreadsheetQuery(spreadshetInput);
      }
    },
    [],
  );

  const { preview, runPreview: handleRunPreview } = useQueryPreview<
    GoogleSheetsPrivateQuery,
    GoogleSheetsResult
  >({
    type: GoogleSheetsPrivateQueryType.DEBUG_EXEC,
    query: input.query,
  });

  const lastSavedInput = React.useRef(input);
  const handleCommit = React.useCallback(() => {
    onChange(input);
    lastSavedInput.current = input;
  }, [onChange, input]);

  const isDirty =
    input.query !== lastSavedInput.current.query || input.params !== lastSavedInput.current.params;

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <SplitPane split="vertical" size="50%" allowResize>
        <QueryInputPanel onRunPreview={handleRunPreview}>
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
              value={input.query.ranges}
              disabled={!input.query.sheetName}
              onChange={handleRangeChange}
            />
            <FormControlLabel
              label="First row contains column headers"
              control={
                <Checkbox
                  checked={input.query.headerRow}
                  onChange={handleTransformChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
            />
          </Stack>
        </QueryInputPanel>

        <Box sx={{ height: '100%', overflow: 'auto', mx: 1 }}>
          {preview?.error ? (
            <ErrorAlert error={preview?.error} />
          ) : (
            <JsonView src={preview?.data} />
          )}
        </Box>
      </SplitPane>
    </QueryEditorShell>
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
