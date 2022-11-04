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
import config from '../../config';
import { ShortcutScope, ShortcutBindings } from '../../components/Shortcuts';

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

const DEFAULT_MODULE = `export default async function ({ parameters }: ToolpadFunctionEvent) {
  console.info("Executing function with parameters:", parameters);
  const url = new URL("${new URL('/static/movies.json', config.externalUrl).href}");
  url.searchParams.set("timestamp", String(Date.now()));

  const response = await fetch(String(url));
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  const json = await response.json();

  return json;
}
`;

function QueryEditor({
  globalScope,
  value: input,
  onChange: setInput,
  onCommit,
}: QueryEditorProps<FunctionConnectionParams, FunctionQuery>) {
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
        /** TODO: remove after v1 */       
        /** @deprecated Use parameters instead */
        params: {
          ${paramsMembers}
        }
        parameters: {
          ${paramsMembers}
        }
        secrets: {
          ${secretsMembers}
        }
      }
    `;

    return [{ content, filePath: 'global.d.ts' }];
  }, [input.params, secretsKeys]);

  const handleLogClear = React.useCallback(() => setPreviewLogs([]), []);
  const handleHarClear = React.useCallback(() => setPreviewHar(createHarLog()), []);

  const handleCommit = React.useCallback(() => onCommit?.(), [onCommit]);

  const shortcuts: ShortcutBindings = React.useMemo(
    () => [[{ code: 'KeyS', metaKey: true }, handleCommit]],
    [handleCommit],
  );

  return (
    <ShortcutScope bindings={shortcuts}>
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
    </ShortcutScope>
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
  transformQueryBeforeCommit(query) {
    return {
      ...query,
      module: tryFormat(query.module),
    };
  },
};

export default dataSource;
