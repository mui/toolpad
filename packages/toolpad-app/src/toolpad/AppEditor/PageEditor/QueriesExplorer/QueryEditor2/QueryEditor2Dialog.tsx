import { Stack, TextField, InputAdornment, Alert, Tab, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, NodeId } from '@mui/toolpad-core';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import invariant from 'invariant';

import { usePageEditorState } from '../../PageEditorProvider';
import * as appDom from '../../../../../appDom';
import dataSources from '../../../../../toolpadDataSources/client';
import { omit, update } from '../../../../../utils/immutability';
import { useEvaluateLiveBinding } from '../../../useEvaluateLiveBinding';
import { useDom } from '../../../../AppState';
import { ConnectionContextProvider } from '../../../../../toolpadDataSources/context';

import BindableEditor from '../../BindableEditor';

import client from '../../../../../api';

function refetchIntervalInSeconds(maybeInterval?: number) {
  if (typeof maybeInterval !== 'number') {
    return undefined;
  }
  const seconds = Math.floor(maybeInterval / 1000);
  return seconds > 0 ? seconds : undefined;
}

interface QueryNodeEditorProps {
  onSave: (newNode: appDom.QueryNode) => void;
  // onRemove?: (nodeId: NodeId) => void;
  nodeId: NodeId;
}

export default function QueryEditorPanel<Q>({ nodeId, onSave }: QueryNodeEditorProps) {
  const { dom } = useDom();

  const node = appDom.getNode(dom, nodeId, 'query');

  const [tab, setTab] = React.useState('config');
  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  }, []);

  const [input, setInput] = React.useState<appDom.QueryNode<Q>>(node);
  React.useEffect(() => {
    setInput(node);
  }, [node]);

  const connectionId = input.attributes.connectionId
    ? appDom.deref(input.attributes.connectionId)
    : null;

  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const dataSourceId = input.attributes.dataSource || null;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes.params;

  const { pageState, globalScopeMeta } = usePageEditorState();

  const handleModeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          mode: event.target.value as appDom.FetchMode,
        }),
      }),
    );
  }, []);

  const handleEnabledChange = React.useCallback((newValue: BindableAttrValue<boolean> | null) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          enabled: newValue ?? undefined,
        }),
      }),
    );
  }, []);

  const handleRefetchIntervalChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const interval = Number(event.target.value);

      setInput((existing) =>
        update(existing, {
          attributes:
            Number.isNaN(interval) || interval <= 0
              ? omit(existing.attributes, 'refetchInterval')
              : update(existing.attributes, {
                  refetchInterval: interval * 1000,
                }),
        }),
      );
    },
    [],
  );

  React.useEffect(() => {
    onSave(input);
  }, [input, onSave]);

  const queryEditorContext = React.useMemo(
    () => (dataSourceId ? { dataSourceId, connectionId } : null),
    [dataSourceId, connectionId],
  );

  const jsBrowserRuntime = useBrowserJsRuntime();

  const liveEnabled = useEvaluateLiveBinding({
    jsRuntime: jsBrowserRuntime,
    input: input.attributes.enabled || null,
    globalScope: pageState,
  });

  const mode = input.attributes.mode || 'query';

  const execPrivate = React.useCallback(
    (method: string, args: any[]) => {
      invariant(dataSourceId, 'dataSourceId must be set');
      return client.mutation.dataSourceExecPrivate(dataSourceId, method, args);
    },
    [dataSourceId],
  );

  return dataSourceId && dataSource && queryEditorContext ? (
    <ConnectionContextProvider value={queryEditorContext}>
      <TabContext value={tab}>
        <TabList
          onChange={handleTabChange}
          sx={{ '& button': { fontSize: 12, fontWeight: 'normal' } }}
        >
          <Tab
            value="config"
            label="Config"
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          />
          <Tab
            value="settings"
            label="Settings"
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          />
        </TabList>
        <TabPanel value="config" sx={{ p: 0 }}>
          <dataSource.QueryEditor
            connectionParams={connectionParams}
            value={input}
            onChange={setInput}
            onSave={onSave}
            globalScope={pageState}
            globalScopeMeta={globalScopeMeta}
            execApi={execPrivate}
          />
        </TabPanel>
        <TabPanel value="settings" sx={{ p: 0 }}>
          <Stack
            display={'grid'}
            gridTemplateRows="1fr 1fr 1fr"
            gridTemplateColumns={'200px 350px'}
            rowGap={0.5}
            marginX={2}
            marginY={1}
          >
            <Typography fontSize={12} sx={{ alignSelf: 'center' }}>
              Set query mode:
            </Typography>
            <TextField
              select
              label="mode"
              value={mode}
              onChange={handleModeChange}
              sx={{
                '& .MuiInputLabel-root': { fontSize: 12 },
                '& .MuiInputBase-root': { fontSize: 12 },
              }}
            >
              <MenuItem value="query">
                Fetch at any time to always be available on the page
              </MenuItem>
              <MenuItem value="mutation">Only fetch on manual action</MenuItem>
            </TextField>

            <Typography fontSize={12} sx={{ alignSelf: 'center' }}>
              Set refetch interval:
            </Typography>
            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">s</InputAdornment>,
              }}
              sx={{
                '& .MuiInputLabel-root': { fontSize: 12 },
                '& .MuiInputBase-root': { fontSize: 12 },
                maxWidth: 200,
              }}
              type="number"
              label="Refetch interval"
              value={refetchIntervalInSeconds(input.attributes.refetchInterval) ?? ''}
              onChange={handleRefetchIntervalChange}
              disabled={mode !== 'query'}
            />
            <Typography fontSize={12} sx={{ alignSelf: 'center' }}>
              Set query enabled/disabled:
            </Typography>
            <BindableEditor<boolean>
              liveBinding={liveEnabled}
              globalScope={pageState}
              globalScopeMeta={globalScopeMeta}
              jsRuntime={jsBrowserRuntime}
              label="Enabled"
              propType={{ type: 'boolean' }}
              value={input.attributes.enabled ?? true}
              onChange={handleEnabledChange}
              disabled={mode !== 'query'}
              sx={{ maxWidth: 100 }}
            />
          </Stack>
        </TabPanel>
      </TabContext>
    </ConnectionContextProvider>
  ) : (
    <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
  );
}
