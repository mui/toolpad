import * as React from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { RowsSpec } from '../../shared/schemas';

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

interface PropertyEditorProps {
  providerSelector: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  value: PropertySpec;
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: (value: PropertySpec) => void;
}

function PropertyEditor({ providerSelector }: PropertyEditorProps) {
  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, p: 2 }}>
        {providerSelector}

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

function applySelector(data: any, selector: string): any {
  if (!selector) {
    return data;
  }

  const parts = selector.split('.');

  let result = data;

  for (const part of parts) {
    if (typeof result !== 'object' || result === null) {
      return undefined;
    }

    result = result[part];
  }

  return result;
}

async function executeFetch(spec: FetchSpec) {
  if (!spec.url) {
    throw new Error(`Url required`);
  }

  const response = await fetch(spec.url, { method: spec.method });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();

  return spec.selector ? applySelector(data, spec.selector) : data;
}

interface FetchEditorProps {
  providerSelector: React.ReactNode;
  value: FetchSpec;
  onChange: (value: FetchSpec) => void;
}

function FetchEditor({ providerSelector, value, onChange }: FetchEditorProps) {
  const [testResult, setTestResult] = React.useState<{ data?: unknown; error?: Error } | null>(
    null,
  );

  const runTest = () => {
    executeFetch(value).then(
      (data) => setTestResult({ data }),
      (error) => setTestResult({ error }),
    );
  };

  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, height: '100%', p: 2 }}>
        {providerSelector}

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
          <TextField
            label="Selector"
            fullWidth
            value={value.selector || ''}
            onChange={(event) => onChange({ ...value, selector: event.target.value })}
          />
        </React.Fragment>
      </Box>
      <Box sx={{ flex: 1, height: '100%', overflow: 'auto', px: 4 }}>
        {testResult?.error ? (
          testResult.error.message
        ) : (
          <pre>
            {typeof testResult?.data === 'undefined'
              ? 'undefined'
              : JSON.stringify(testResult?.data, null, 2)}
          </pre>
        )}
      </Box>
    </Stack>
  );
}

export interface RowsEditorProps {
  value: RowsSpec;
  onChange: (value: RowsSpec) => void;
}

export default function RowsEditor({ value, onChange }: RowsEditorProps) {
  const providerSelector = (
    <TextField
      select
      value={value.kind ?? 'property'}
      label="Data Provider"
      onChange={(event) =>
        onChange({
          kind: event.target.value as RowsSpec['kind'],
        })
      }
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
        <PropertyEditor providerSelector={providerSelector} value={value} onChange={onChange} />
      );
    case 'fetch':
      return <FetchEditor providerSelector={providerSelector} value={value} onChange={onChange} />;
    default:
      return null;
  }
}
