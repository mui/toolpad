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
import { inferColumns, parseColumns } from '@mui/toolpad-components';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { UseQueryResult } from '@tanstack/react-query';
import { getObjectKey } from '@mui/toolpad-utils/objectKey';
import useDebounced from '@mui/toolpad-utils/hooks/useDebounced';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsApiQuery,
  GoogleDriveFile,
  GoogleSpreadsheet,
  GoogleSheet,
  GoogleDriveFiles,
  GoogleDriveUser,
  GoogleSheetsPrivateQuery,
  GoogleSheetsResult,
} from './types';
import { usePrivateQuery } from '../context';
import QueryInputPanel from '../QueryInputPanel';
import useQueryPreview from '../useQueryPreview';
import useFetchPrivate from '../useFetchPrivate';
import * as appDom from '../../appDom';

const EMPTY_ROWS: any[] = [];

function getInitialQueryValue(): GoogleSheetsApiQuery {
  return { ranges: 'A1:Z10', spreadsheetId: '', sheetName: '', headerRow: false };
}

function QueryEditor({
  value: input,
  onChange: setInput,
}: QueryEditorProps<GoogleSheetsConnectionParams, GoogleSheetsApiQuery>) {
  const [spreadsheetQuery, setSpreadsheetQuery] = React.useState<string | null>(null);

  const debouncedSpreadsheetQuery = useDebounced(spreadsheetQuery, 300);

  const fetchedFiles: UseQueryResult<GoogleDriveFiles> = usePrivateQuery({
    type: 'FILES_LIST',
    spreadsheetQuery: debouncedSpreadsheetQuery,
  });

  const fetchedFile: UseQueryResult<GoogleDriveFile> = usePrivateQuery(
    input.attributes.query.spreadsheetId
      ? {
          type: 'FILE_GET',
          spreadsheetId: input.attributes.query.spreadsheetId,
        }
      : null,
  );

  const fetchedSpreadsheet: UseQueryResult<GoogleSpreadsheet> = usePrivateQuery(
    input.attributes.query.spreadsheetId
      ? {
          type: 'FETCH_SPREADSHEET',
          spreadsheetId: input.attributes.query.spreadsheetId,
        }
      : null,
  );

  const selectedSheet = React.useMemo(
    () =>
      fetchedSpreadsheet.data?.sheets?.find(
        (sheet) => sheet.properties?.title === input.attributes.query.sheetName,
      ) ?? null,
    [fetchedSpreadsheet, input],
  );

  const handleSpreadsheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleDriveFile | null) => {
      setInput?.((existing) => {
        existing = appDom.setQueryProp(existing, 'sheetName', null);
        existing = appDom.setQueryProp(existing, 'spreadsheetId', newValue?.id ?? null);
        return existing;
      });
    },
    [setInput],
  );

  const handleSheetChange = React.useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: GoogleSheet | null) => {
      setInput?.((existing) =>
        appDom.setQueryProp(existing, 'sheetName', newValue?.properties?.title ?? null),
      );
    },
    [setInput],
  );

  const handleRangeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput?.((existing) => appDom.setQueryProp(existing, 'ranges', event.target.value));
    },
    [setInput],
  );

  const handleTransformChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput?.((existing) => appDom.setQueryProp(existing, 'headerRow', event.target.checked));
    },
    [setInput],
  );

  const handleSpreadsheetInput = React.useCallback(
    (event: React.SyntheticEvent, spreadshetInput: string, reason: string) => {
      if (reason === 'input') {
        setSpreadsheetQuery(spreadshetInput);
      }
    },
    [],
  );

  const fetchPrivate = useFetchPrivate<GoogleSheetsPrivateQuery, GoogleSheetsResult>();
  const fetchServerPreview = React.useCallback(
    (query: GoogleSheetsApiQuery) => fetchPrivate({ type: 'DEBUG_EXEC', query }),
    [fetchPrivate],
  );

  const {
    preview,
    runPreview: handleRunPreview,
    isLoading: previewIsLoading,
  } = useQueryPreview(fetchServerPreview, input.attributes.query, {});

  const rawRows: any[] = preview?.data || EMPTY_ROWS;
  const columns: GridColDef[] = React.useMemo(() => parseColumns(inferColumns(rawRows)), [rawRows]);
  const rows = React.useMemo(() => rawRows.map((row, id) => ({ id, ...row })), [rawRows]);
  const previewGridKey = React.useMemo(() => getObjectKey(columns), [columns]);

  return (
    <PanelGroup autoSaveId="toolpad/google-sheets-panel" direction="horizontal">
      <Panel id="google-sheets-query-config" defaultSize={50}>
        <QueryInputPanel onRunPreview={handleRunPreview}>
          <Stack direction="column" gap={2} sx={{ px: 3, pt: 1 }}>
            <Autocomplete
              fullWidth
              value={fetchedFile.data ?? null}
              loading={fetchedFiles.isLoading}
              loadingText={'Loading…'}
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
              loadingText={'Loading…'}
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
              value={input.attributes.query.ranges}
              disabled={!input.attributes.query.sheetName}
              onChange={handleRangeChange}
            />
            <FormControlLabel
              label="First row contains column headers"
              control={
                <Checkbox
                  checked={input.attributes.query.headerRow}
                  onChange={handleTransformChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
            />
          </Stack>
        </QueryInputPanel>
      </Panel>
      <PanelResizeHandle />
      <Panel id="google-sheets-query-response" defaultSize={50}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {preview?.error ? (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="error">{preview?.error?.message}</Typography>
            </Box>
          ) : (
            <DataGridPro
              sx={{ border: 'none', flex: 1 }}
              columns={columns}
              key={previewGridKey}
              rows={rows}
              loading={previewIsLoading}
            />
          )}
        </Box>
      </Panel>
    </PanelGroup>
  );
}

function ConnectionParamsInput({
  connectionId,
  handlerBasePath,
}: ConnectionEditorProps<GoogleSheetsConnectionParams>) {
  const validatedUser: UseQueryResult<GoogleDriveUser> = usePrivateQuery(
    {
      type: 'CONNECTION_STATUS',
    },
    { retry: false },
  );
  return (
    <Stack direction="column" gap={1}>
      <Button
        component="a"
        disabled={Boolean(validatedUser.data)}
        href={`${handlerBasePath}/auth/login?state=${encodeURIComponent(
          JSON.stringify({ connectionId }),
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
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
