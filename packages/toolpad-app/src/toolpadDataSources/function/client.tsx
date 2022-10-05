import * as React from 'react';
import { Box, Button, Skeleton, Stack, Toolbar, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  FunctionConnectionParams,
  FunctionPrivateQuery,
  FunctionQuery,
  FunctionResult,
} from './types';
import lazyComponent from '../../utils/lazyComponent';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import SplitPane from '../../components/SplitPane';
import { usePrivateQuery } from '../context';
import JsonView from '../../components/JsonView';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import { LogEntry } from '../../components/Console';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import { isSaveDisabled } from '../../utils/forms';
import Devtools from '../../components/Devtools';
import { createHarLog, mergeHar } from '../../utils/har';
import useQueryPreview from '../useQueryPreview';
import QueryInputPanel from '../QueryInputPanel';
import { useEvaluateLiveBindingEntries } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import { tryFormat } from '../../utils/prettier';
import useShortcut from '../../utils/useShortcut';

const EVENT_INTERFACE_IDENTIFIER = 'ToolpadFunctionEvent';

const TypescriptEditor = lazyComponent(() => import('../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function withDefaults(value: Maybe<FunctionConnectionParams>): FunctionConnectionParams {
  return {
    secrets: [],
    ...value,
  };
}

function ConnectionParamsInput({
  value,
  onChange,
}: ConnectionEditorProps<FunctionConnectionParams>) {
  const { handleSubmit, formState, reset, control } = useForm({
    defaultValues: withDefaults(value),
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  return (
    <Stack direction="column" gap={3} sx={{ py: 3 }}>
      <Typography>Secrets:</Typography>
      <Controller
        name="secrets"
        control={control}
        render={({ field: { value: fieldValue = [], onChange: onFieldChange, ref, ...field } }) => {
          return (
            <MapEntriesEditor
              {...field}
              fieldLabel="key"
              value={fieldValue}
              onChange={onFieldChange}
            />
          );
        }}
      />

      <Toolbar disableGutters>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
      </Toolbar>
    </Stack>
  );
}

const DEFAULT_MODULE = `export default async function ({ parameters }: ${EVENT_INTERFACE_IDENTIFIER}) {
  console.info('Executing function with parameters:', parameters);
  const url = new URL('https://gist.githubusercontent.com/saniyusuf/406b843afdfb9c6a86e25753fe2761f4/raw/523c324c7fcc36efab8224f9ebb7556c09b69a14/Film.JSON');
  url.searchParams.set('timestamp', String(Date.now()));
  const response = await fetch(String(url));
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  return response.json();
}`;

function QueryEditor({
  QueryEditorShell,
  globalScope,
  value,
  onChange,
}: QueryEditorProps<FunctionConnectionParams, FunctionQuery>) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    input: input.params,
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding.value])),
    [paramsEditorLiveValue],
  );

  const [previewLogs, setPreviewLogs] = React.useState<LogEntry[]>([]);
  const [previewHar, setPreviewHar] = React.useState(() => createHarLog());
  const { preview, runPreview: handleRunPreview } = useQueryPreview<
    FunctionPrivateQuery,
    FunctionResult
  >(
    {
      kind: 'debugExec',
      query: input.query,
      params: previewParams,
    },
    {
      onPreview(result) {
        setPreviewLogs((existing) => [...existing, ...result.logs]);
        setPreviewHar((existing) => mergeHar(createHarLog(), existing, result.har));
      },
    },
  );

  const { data: secretsKeys = [] } = usePrivateQuery<FunctionPrivateQuery, string[]>({
    kind: 'secretsKeys',
  });

  const extraLibs = React.useMemo(() => {
    const paramsKeys = input.params.map(([key]) => key);
    const paramsMembers = paramsKeys.map((key) => `${key}: string`).join('\n');
    const secretsMembers = secretsKeys.map((key) => `${key}: string`).join('\n');

    const content = `
      interface ${EVENT_INTERFACE_IDENTIFIER} {       
        parameters: {
          ${paramsMembers}
        }
        secrets: {
          ${secretsMembers}
        }
      }
    `;

    return [{ content, filePath: 'file:///node_modules/@mui/toolpad/index.d.ts' }];
  }, [input.params, secretsKeys]);

  const handleLogClear = React.useCallback(() => setPreviewLogs([]), []);
  const handleHarClear = React.useCallback(() => setPreviewHar(createHarLog()), []);

  const handleCommit = React.useCallback(
    () =>
      onChange({
        ...input,
        query: {
          ...input.query,
          module: tryFormat(input.query.module),
        },
      }),
    [onChange, input],
  );

  useShortcut({ code: 'KeyS', metaKey: true }, handleCommit);

  const isDirty = input !== value;

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size={85} primary="second" allowResize>
          <QueryInputPanel onRunPreview={handleRunPreview}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <TypescriptEditor
                value={input.query.module}
                onChange={(newValue) =>
                  setInput((existing) => ({ ...existing, query: { module: newValue } }))
                }
                extraLibs={extraLibs}
              />
            </Box>
          </QueryInputPanel>

          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography>Parameters</Typography>
            <ParametersEditor
              value={input.params}
              onChange={(newParams) => setInput((existing) => ({ ...existing, params: newParams }))}
              globalScope={globalScope}
              liveValue={paramsEditorLiveValue}
            />
          </Box>
        </SplitPane>

        <SplitPane split="horizontal" size="30%" minSize={30} primary="second" allowResize>
          {preview?.error ? (
            <ErrorAlert error={preview?.error} />
          ) : (
            <JsonView sx={{ height: '100%' }} copyToClipboard src={preview?.data} />
          )}

          <Devtools
            sx={{ width: '100%', height: '100%' }}
            log={previewLogs}
            onLogClear={handleLogClear}
            har={previewHar}
            onHarClear={handleHarClear}
          />
        </SplitPane>
      </SplitPane>
    </QueryEditorShell>
  );
}

function getInitialQueryValue(): FunctionQuery {
  return { module: DEFAULT_MODULE };
}

const dataSource: ClientDataSource<FunctionConnectionParams, FunctionQuery> = {
  displayName: 'Function',
  ConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
