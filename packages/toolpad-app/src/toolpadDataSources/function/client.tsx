import * as React from 'react';

import { Box, Button, Skeleton, Stack, Toolbar, Typography } from '@mui/material';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';

import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { Controller, useForm } from 'react-hook-form';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import {
  FunctionConnectionParams,
  FunctionPrivateQuery,
  FunctionQuery,
  FunctionResult,
} from './types';
import lazyComponent from '../../utils/lazyComponent';
import ParametersEditor from '../../components/AppEditor/PageEditor/ParametersEditor';
import SplitPane from '../../components/SplitPane';
import { useConnectionContext, usePrivateQuery } from '../context';
import client from '../../api';
import JsonView from '../../components/JsonView';
import ErrorAlert from '../../components/AppEditor/PageEditor/ErrorAlert';
import Console, { LogEntry } from './Console';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import { isSaveDisabled } from '../../utils/forms';

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

const DEFAULT_MODULE = `export default async function ({ params }: ${EVENT_INTERFACE_IDENTIFIER}) {
  console.info('Executing function', params);
  const url = new URL('https://gist.githubusercontent.com/saniyusuf/406b843afdfb9c6a86e25753fe2761f4/raw/523c324c7fcc36efab8224f9ebb7556c09b69a14/Film.JSON');
  url.searchParams.set('timestamp', String(Date.now()));
  const response = await fetch(String(url));
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  return response.json();
}`;

function QueryEditor({
  globalScope,
  liveParams,
  value,
  onChange,
}: QueryEditorProps<FunctionConnectionParams, FunctionQuery>) {
  const [params, setParams] = React.useState<[string, BindableAttrValue<any>][]>(
    Object.entries(value.params || ({} as BindableAttrValue<Record<string, any>>)),
  );

  React.useEffect(
    () => setParams(Object.entries(value.params || ({} as BindableAttrValue<Record<string, any>>))),
    [value.params],
  );

  const handleParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<any>][]) => {
      setParams(newParams);
      const paramsObj: BindableAttrValues<any> = Object.fromEntries(newParams);
      onChange({ ...value, params: paramsObj });
    },
    [onChange, value],
  );

  const paramsEditorLiveValue: [string, LiveBinding][] = params.map(([key]) => [
    key,
    liveParams[key],
  ]);

  const { appId, connectionId } = useConnectionContext();
  const [preview, setPreview] = React.useState<FunctionResult | null>(null);
  const [previewLogs, setPreviewLogs] = React.useState<LogEntry[]>([]);

  const cancelRunPreview = React.useRef<(() => void) | null>(null);
  const runPreview = React.useCallback(() => {
    let canceled = false;

    cancelRunPreview.current?.();
    cancelRunPreview.current = () => {
      canceled = true;
    };

    const currentParams = Object.fromEntries(
      paramsEditorLiveValue.map(([key, binding]) => [key, binding.value]),
    );

    client.query
      .dataSourceFetchPrivate(appId, connectionId, {
        kind: 'debugExec',
        query: value.query,
        params: currentParams,
      } as FunctionPrivateQuery)
      .then((result) => {
        if (!canceled) {
          setPreview(result);
          setPreviewLogs((existing) => [...existing, ...result.logs]);
        }
      })
      .finally(() => {
        cancelRunPreview.current = null;
      });
  }, [appId, connectionId, paramsEditorLiveValue, value.query]);

  const { data: secretsKeys = [] } = usePrivateQuery<FunctionPrivateQuery, string[]>({
    kind: 'secretsKeys',
  });

  const extraLibs = React.useMemo(() => {
    const paramsKeys = params.map(([key]) => key);
    const paramsMembers = paramsKeys.map((key) => `${key}: string`).join('\n');
    const secretsMembers = secretsKeys.map((key) => `${key}: string`).join('\n');

    const content = `
      interface ${EVENT_INTERFACE_IDENTIFIER} {       
        params: {
          ${paramsMembers}
        }
        secrets: {
          ${secretsMembers}
        }
      }
    `;

    return [{ content, filePath: 'file:///node_modules/@mui/toolpad/index.d.ts' }];
  }, [params, secretsKeys]);

  return (
    <Box sx={{ height: 500, position: 'relative' }}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size={20} primary="second" allowResize>
          <TypescriptEditor
            value={value.query.module}
            onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
            extraLibs={extraLibs}
          />

          <Box sx={{ p: 2 }}>
            <Typography>Parameters</Typography>
            <ParametersEditor
              value={params}
              onChange={handleParamsChange}
              globalScope={globalScope}
              liveValue={paramsEditorLiveValue}
            />
          </Box>
        </SplitPane>

        <SplitPane split="horizontal" size="30%" minSize={30} primary="second" allowResize>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar>
              <LoadingButton startIcon={<PlayArrowIcon />} onClick={() => runPreview()}>
                Preview
              </LoadingButton>
            </Toolbar>
            <Box sx={{ flex: 1, overflow: 'auto', mx: 1 }}>
              {preview?.error ? (
                <ErrorAlert error={preview?.error} />
              ) : (
                <JsonView src={preview?.data} />
              )}
            </Box>
          </Box>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar>
              <Button startIcon={<DoDisturbIcon />} onClick={() => setPreviewLogs([])}>
                Clear
              </Button>
            </Toolbar>

            <Console sx={{ flex: 1, overflow: 'auto' }} entries={previewLogs} />
          </Box>
        </SplitPane>
      </SplitPane>
    </Box>
  );
}

function getInitialQueryValue(): FunctionQuery {
  return { module: DEFAULT_MODULE };
}

const dataSource: ClientDataSource<FunctionConnectionParams, FunctionQuery> = {
  displayName: 'Function',
  ConnectionParamsInput,
  isConnectionValid: () => true,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
