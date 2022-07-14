import * as React from 'react';
import { Box, Button, Skeleton, Stack, styled, Tab, Toolbar, Typography } from '@mui/material';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';

import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
import Console, { LogEntry } from '../../components/Console';
import MapEntriesEditor from '../../components/MapEntriesEditor';
import { Maybe } from '../../utils/types';
import { isSaveDisabled } from '../../utils/forms';

const HarViewer = lazyComponent(() => import('../../components/HarViewer'), {});

const DebuggerTabs = styled(TabList)({
  minHeight: 0,
  '& .MuiTab-root ': { padding: 8, minHeight: 0 },
});
const DebuggerTabPanel = styled(TabPanel)({ padding: 0, flex: 1, minHeight: 0 });

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
  console.info('Executing function with params:', params);
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

  const [debuggerTab, setDebuggerTab] = React.useState('console');
  const handleDebuggerTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setDebuggerTab(newValue);
  };

  return (
    <Box sx={{ height: 500, position: 'relative' }}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size={85} primary="second" allowResize>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar>
              <LoadingButton startIcon={<PlayArrowIcon />} onClick={() => runPreview()}>
                Preview
              </LoadingButton>
            </Toolbar>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <TypescriptEditor
                value={value.query.module}
                onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
                extraLibs={extraLibs}
              />
            </Box>
          </Box>

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
          <Box sx={{ height: '100%', overflow: 'auto', mx: 1 }}>
            {preview?.error ? (
              <ErrorAlert error={preview?.error} />
            ) : (
              <JsonView src={preview?.data} />
            )}
          </Box>

          <TabContext value={debuggerTab}>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <DebuggerTabs onChange={handleDebuggerTabChange} aria-label="Debugger">
                  <Tab label="Console" value="console" />
                  <Tab label="Network" value="network" />
                </DebuggerTabs>
              </Box>
              <DebuggerTabPanel value="console">
                <Console sx={{ flex: 1 }} value={previewLogs} onChange={setPreviewLogs} />
              </DebuggerTabPanel>
              <DebuggerTabPanel value="network">
                <HarViewer har={preview?.har} />
              </DebuggerTabPanel>
            </Box>
          </TabContext>

          {/*       <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
 <Console sx={{ flex: 1 }} value={previewLogs} onChange={setPreviewLogs} /> 
          </Box> */}
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
