import * as React from 'react';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import useDebouncedHandler from '@mui/toolpad-utils/hooks/useDebouncedHandler';
import { DataGridSpec, RowsSpec } from '../../shared/schemas';
import JsonPointerInput from '../JsonPointerInput';
import { useProbe } from '../probes';

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
  const liveRows = useProbe('rows');

  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, p: 2 }}>
        {providerSelectorInput}
        {renderRowIdSelectorInput({ target: (liveRows as any)?.[0] })}
        <Typography>
          Pass the data through a <code>rows</code> property on your component.
          {/* TODO: show example */}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>right</Box>
    </Stack>
  );
}

function useDebouncedInput<T>(
  value: T,
  onChange: (value: T) => void,
  delay: number,
): [T, (newValue: T) => void] {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    setInput(value);
  }, [value]);

  const debouncedOnChange = useDebouncedHandler(onChange, delay);

  const handleInputChange = React.useCallback(
    (newValue: T) => {
      setInput(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange],
  );

  return [input, handleInputChange];
}

function rowSelectorFilter(value: unknown): boolean {
  return Array.isArray(value) && (value.length <= 0 || (value[0] && typeof value[0] === 'object'));
}

function rowIdSelectorFilter(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

type FetchSpec = Extract<RowsSpec, { kind: 'fetch' }>;

interface FetchEditorProps {
  providerSelectorInput: React.ReactNode;
  renderRowIdSelectorInput: RenderRowIdSelectorInput;
  value: FetchSpec;
  onChange: (value: FetchSpec) => void;
}

function FetchEditor({
  providerSelectorInput,
  renderRowIdSelectorInput,
  value: valueProp,
  onChange: onChangeProp,
}: FetchEditorProps) {
  const [input, setInput] = useDebouncedInput(valueProp, onChangeProp, 300);

  const liveRows = useProbe('rows');
  const rawData = useProbe('fetch.rawData');

  return (
    <Stack sx={{ width: '100%', height: '100%' }} direction="row">
      <Box sx={{ flex: 1, height: '100%', p: 2, overflow: 'auto' }}>
        {providerSelectorInput}

        <React.Fragment>
          <Stack direction="row" sx={{ gap: 1 }}>
            <TextField
              select
              sx={{ width: '110px' }}
              value={input.method ?? 'GET'}
              label="Method"
              onChange={(event) =>
                setInput({
                  ...input,
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
              value={input.url || '/'}
              onChange={(event) => setInput({ ...input, url: event.target.value })}
            />
          </Stack>
          <JsonPointerInput
            label="Rows Selector"
            target={rawData}
            filter={rowSelectorFilter}
            fullWidth
            value={input.selector || ''}
            onChange={(newValue) => setInput({ ...input, selector: newValue })}
            helperText={
              <React.Fragment>
                Valid <a href="https://datatracker.ietf.org/doc/html/rfc6901">JSON Pointer</a> that
                references a (nested) property in the returned data that represents the rows.
              </React.Fragment>
            }
          />
          {renderRowIdSelectorInput({ target: (liveRows as any)?.[0] })}
        </React.Fragment>
      </Box>
      <Box sx={{ flex: 1, height: '100%', overflow: 'auto', px: 4 }}>
        {
          <pre>
            {typeof liveRows === 'undefined' ? 'undefined' : JSON.stringify(liveRows, null, 2)}
          </pre>
        }
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
      value={value.rowIdSelector || ''}
      filter={rowIdSelectorFilter}
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
