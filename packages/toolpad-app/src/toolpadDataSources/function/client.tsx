import * as React from 'react';

import { Box, Button, Skeleton, Stack, Toolbar, Typography } from '@mui/material';
import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';

import { ClientDataSource, QueryEditorProps } from '../../types';
import { FunctionConnectionParams, FunctionQuery, FunctionResult, LogEntry } from './types';
import lazyComponent from '../../utils/lazyComponent';
import ParametersEditor from '../../components/AppEditor/PageEditor/ParametersEditor';
import SplitPane from '../../components/SplitPane';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useConnectionContext } from '../context';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import client from '../../api';
import JsonView from '../../components/JsonView';
import ErrorAlert from '../../components/AppEditor/PageEditor/ErrorAlert';
import Console from './Console';

const TypescriptEditor = lazyComponent(() => import('../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

function ConnectionParamsInput() {
  return <Stack direction="column" gap={3} sx={{ py: 3 }} />;
}

const DEFAULT_MODULE = `export default async function () {
  throw new Error('Not implemented');
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
  const runPreview = React.useCallback(() => {
    client.query.dataSourceFetchPrivate(appId, connectionId, value).then((result) => {
      setPreview(result);
      setPreviewLogs((existing) => [...existing, ...result.logs]);
    });
  }, [appId, connectionId, value]);

  return (
    <Box sx={{ height: 500, position: 'relative' }}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size={20} primary="second" allowResize>
          <TypescriptEditor
            value={value.query.module}
            onChange={(newValue) => onChange({ ...value, query: { module: newValue } })}
          />

          <Box>
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
                <JsonView src={preview?.data}></JsonView>
              )}
            </Box>
          </Box>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar>
              <Button startIcon={<DoDisturbIcon />} onClick={() => setPreviewLogs([])}>
                Clear
              </Button>
            </Toolbar>

            <Console sx={{ flex: 1, overflow: 'auto', mx: 1 }} entries={previewLogs} />
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
