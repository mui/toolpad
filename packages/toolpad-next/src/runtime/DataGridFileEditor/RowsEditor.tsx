import * as React from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGridSpec, RowsSpec } from '../../shared/schemas';
import * as jsonPath from '../../shared/jsonPointer';
import JsonPointerInput from '../JsonPointerInput';

const DATA_KIND_OPTIONS = [
  {
    value: 'property',
    label: 'Property',
  },
  {
    value: 'fetch',
    label: 'Fetch from REST API',
  },
];

const FETCH_METHOD_OPTIONS = ['GET', 'POST'] as const;

type PropertySpec = Extract<RowsSpec, { kind: 'property' }>;

interface RenderRowIdSelectorInput {
  (params?: { target?: unknown }): React.ReactNode;
}

interface PropertyEditorProps {
  providerSelectorInput: React.ReactNode;
  renderRowIdSelectorInput: RenderRowIdSelectorInput;
  // eslint-disable-next-line react/no-unused-prop-types
  value: PropertySpec;
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: (value: PropertySpec) => void;
}

function PropertyEditor({ providerSelectorInput, renderRowIdSelectorInput }: PropertyEditorProps) {
  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, p: 2 }}>
        {providerSelectorInput}
        {renderRowIdSelectorInput()}
        <Typography>
          Pass the data through a <code>rows</code> property on your component.
          {/* TODO: show example */}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>right</Box>
    </Stack>
  );
}

type FetchSpec = Extract<RowsSpec, { kind: 'fetch' }>;

interface FetchResult {
  status: number;
  data: unknown;
  transformed: unknown;
}

async function executeFetch(spec: FetchSpec): Promise<FetchResult> {
  const response = await fetch(spec.url || '', { method: spec.method });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    status: response.status,
    data,
    transformed: spec.selector ? jsonPath.resolve(data, spec.selector) : data,
  };
}

interface FetchEditorProps {
  providerSelectorInput: React.ReactNode;
  renderRowIdSelectorInput: RenderRowIdSelectorInput;
  value: FetchSpec;
  onChange: (value: FetchSpec) => void;
}

function FetchEditor({
  providerSelectorInput,
  renderRowIdSelectorInput,
  value,
  onChange,
}: FetchEditorProps) {
  const [testOutput, setTestResult] = React.useState<{
    result?: FetchResult;
    error?: Error;
  } | null>(null);

  const runTest = () => {
    executeFetch(value).then(
      (result) => setTestResult({ result }),
      (error) => setTestResult({ error }),
    );
  };

  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, height: '100%', p: 2 }}>
        {providerSelectorInput}

        <React.Fragment>
          <Stack direction="row" sx={{ gap: 1 }}>
            <TextField
              select
              sx={{ width: '110px' }}
              value={value.method ?? 'GET'}
              label="Method"
              onChange={(event) =>
                onChange({
                  ...value,
                  method: event.target.value as (typeof FETCH_METHOD_OPTIONS)[number],
                })
              }
            >
              {FETCH_METHOD_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="URL"
              fullWidth
              value={value.url || '/'}
              onChange={(event) => onChange({ ...value, url: event.target.value })}
            />
            <Button onClick={runTest}>Test</Button>
          </Stack>
          <JsonPointerInput
            label="Rows Selector"
            target={testOutput?.result?.data}
            fullWidth
            value={value.selector || '/'}
            onChange={(newValue) => onChange({ ...value, selector: newValue })}
            helperText={
              <React.Fragment>
                Valid <a href="https://datatracker.ietf.org/doc/html/rfc6901">JSON Pointer</a> that
                references a (nested) property in the returned data that represents the rows.
              </React.Fragment>
            }
          />
          {renderRowIdSelectorInput({ target: (testOutput?.result?.transformed as any)?.[0] })}
        </React.Fragment>
      </Box>
      <Box sx={{ flex: 1, height: '100%', overflow: 'auto', px: 4 }}>
        {testOutput?.error ? (
          testOutput.error.message
        ) : (
          <pre>
            {typeof testOutput?.result?.transformed === 'undefined'
              ? 'undefined'
              : JSON.stringify(testOutput.result.transformed, null, 2)}
          </pre>
        )}
      </Box>
    </Stack>
  );
}

export interface RowsSpecEditorProps {
  renderRowIdSelectorInput: RenderRowIdSelectorInput;
  value: RowsSpec;
  onChange: (value: RowsSpec) => void;
}

export function RowsSpecEditor({ value, onChange, renderRowIdSelectorInput }: RowsSpecEditorProps) {
  const providerSelectorInput = (
    <TextField
      select
      value={value.kind ?? 'property'}
      label="Data Provider"
      onChange={(event) => {
        const newKind = event.target.value as RowsSpec['kind'];
        onChange({ kind: newKind });
      }}
    >
      {DATA_KIND_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  switch (value.kind) {
    case 'property':
      return (
        <PropertyEditor
          providerSelectorInput={providerSelectorInput}
          renderRowIdSelectorInput={renderRowIdSelectorInput}
          value={value}
          onChange={onChange}
        />
      );
    case 'fetch':
      return (
        <FetchEditor
          providerSelectorInput={providerSelectorInput}
          renderRowIdSelectorInput={renderRowIdSelectorInput}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

export interface RowsEditorProps {
  value: DataGridSpec;
  onChange: (value: DataGridSpec) => void;
}

export default function RowsEditor({ value, onChange }: RowsEditorProps) {
  const renderRowIdSelectorInput: RenderRowIdSelectorInput = ({ target } = {}) => (
    <JsonPointerInput
      label="Row ID selector"
      value={value.rowIdSelector || '/'}
      onChange={(newValue) => onChange({ ...value, rowIdSelector: newValue })}
      target={target}
      helperText={
        <React.Fragment>
          Valid <a href="https://datatracker.ietf.org/doc/html/rfc6901">JSON Pointer</a> that
          references a (nested) property in the rows, to be used as a unique identifier.
        </React.Fragment>
      }
    />
  );

  return (
    <RowsSpecEditor
      renderRowIdSelectorInput={renderRowIdSelectorInput}
      value={value.rows || { kind: 'property' }}
      onChange={(rows) => onChange({ ...value, rows })}
    />
  );
}
