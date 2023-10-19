import { Box, Stack, TextField, InputAdornment, Alert, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import invariant from 'invariant';

import { usePageEditorState } from '../PageEditorProvider';
import * as appDom from '../../../../appDom';
import dataSources from '../../../../toolpadDataSources/client';
import { useEvaluateLiveBinding } from '../../useEvaluateLiveBinding';
import { useAppState, useAppStateApi } from '../../../AppState';
import { QueryEditorTabType } from '../../../../types';
import { ConnectionContextProvider } from '../../../../toolpadDataSources/context';
import BindableEditor from '../BindableEditor';
import { useProjectApi } from '../../../../projectApi';

interface QueryEditorProps {
  draft: appDom.QueryNode;
  saved?: appDom.QueryNode;
}

function refetchIntervalInSeconds(maybeInterval?: number) {
  if (typeof maybeInterval !== 'number') {
    return undefined;
  }
  const seconds = Math.floor(maybeInterval / 1000);
  return seconds > 0 ? seconds : undefined;
}

const settingsToggleIconStyles = {
  p: 0,
  mr: 1,
  color: 'primary.main',
  fontSize: 16,
  cursor: 'pointer',
  '&:hover': {
    color: 'primary.dark',
  },
};

interface QuerySettingsToggleButtonProps {
  tabType: QueryEditorTabType;
  handleTabTypeChange: () => void;
}

function QuerySettingsToggleButton({
  tabType,
  handleTabTypeChange,
}: QuerySettingsToggleButtonProps) {
  return tabType === 'config' ? (
    <SettingsIcon sx={settingsToggleIconStyles} onClick={handleTabTypeChange} />
  ) : (
    <DynamicFormIcon sx={settingsToggleIconStyles} onClick={handleTabTypeChange} />
  );
}

interface QuerySettingsTabProps {
  liveEnabled: LiveBinding;
  pageState: any;
  globalScopeMeta: any;
  jsBrowserRuntime: any;
}

function QuerySettingsTab({
  liveEnabled,
  pageState,
  globalScopeMeta,
  jsBrowserRuntime,
}: QuerySettingsTabProps) {
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();

  const draftQuery = React.useMemo(() => {
    if (
      currentView.kind === 'page' &&
      currentView.view?.kind === 'query' &&
      currentView.queryPanel?.queryTabs &&
      currentView.queryPanel?.currentTabIndex !== undefined
    ) {
      return currentView.queryPanel?.queryTabs[currentView.queryPanel?.currentTabIndex]?.draft;
    }
    return null;
  }, [currentView]);

  const updateAttribute = React.useCallback(
    (attrName: string, attrValue: any) => {
      appStateApi.updateQueryDraft((draft) => ({
        ...draft,
        attributes: {
          ...draft.attributes,
          [attrName]: attrValue,
        },
      }));
    },
    [appStateApi],
  );

  const handleModeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateAttribute('mode', event.target.value);
    },
    [updateAttribute],
  );

  const handleEnabledChange = React.useCallback(
    (newValue: BindableAttrValue<boolean> | null) => {
      if (newValue !== null) {
        updateAttribute('enabled', newValue);
      }
    },
    [updateAttribute],
  );

  const handleRefetchIntervalChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const interval = Number(event.target.value);

      if (!Number.isNaN(interval) && interval > 0) {
        updateAttribute('refetchInterval', interval * 1000);
      }
    },
    [updateAttribute],
  );
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      sx={{
        p: 0.25,
        mt: 1,
        ml: 1,
        mr: 1,
      }}
    >
      <Stack
        display={'grid'}
        gridTemplateRows="1fr 1fr 1fr"
        gridTemplateColumns={'0.45fr 1fr'}
        rowGap={0.5}
      >
        <Typography fontSize={12} sx={{ alignSelf: 'center' }}>
          Set query mode:
        </Typography>
        <TextField
          select
          label="mode"
          value={draftQuery?.attributes?.mode ?? 'query'}
          onChange={handleModeChange}
          sx={{
            '& .MuiInputLabel-root': { fontSize: 12 },
            '& .MuiInputBase-root': { fontSize: 12 },
          }}
        >
          <MenuItem value="query">Fetch at any time to always be available on the page</MenuItem>
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
          value={refetchIntervalInSeconds(draftQuery?.attributes?.refetchInterval) ?? ''}
          onChange={handleRefetchIntervalChange}
          disabled={draftQuery?.attributes?.mode !== 'query'}
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
          value={draftQuery?.attributes?.enabled ?? true}
          onChange={handleEnabledChange}
          disabled={draftQuery?.attributes?.mode !== 'query'}
          sx={{ maxWidth: 100 }}
        />
      </Stack>
    </Box>
  );
}

export default function QueryEditorPanel({ draft, saved }: QueryEditorProps) {
  const { dom } = useAppState();
  const projectApi = useProjectApi();

  const { data: runtimeConfig, status: runtimeConfigFetchStatus } = projectApi.useQuery(
    'getRuntimeConfig',
    [],
  );

  const connectionId =
    appDom.deref(saved ? saved?.attributes?.connectionId : draft?.attributes?.connectionId) ?? null;

  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const dataSourceId = saved ? saved?.attributes?.dataSource : draft?.attributes?.dataSource;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes?.params;

  const { pageState, globalScopeMeta } = usePageEditorState();

  const queryEditorContext = React.useMemo(
    () => (dataSourceId ? { dataSourceId, connectionId } : null),
    [dataSourceId, connectionId],
  );

  const jsBrowserRuntime = useBrowserJsRuntime();

  const liveEnabled = useEvaluateLiveBinding({
    jsRuntime: jsBrowserRuntime,
    input: draft?.attributes?.enabled || null,
    globalScope: pageState,
  });

  const execPrivate = React.useCallback(
    (method: string, args: any[]) => {
      invariant(dataSourceId, 'dataSourceId must be set');
      return projectApi.methods.dataSourceExecPrivate(dataSourceId, method, args);
    },
    [projectApi, dataSourceId],
  );

  const [tabType, setTabType] = React.useState<QueryEditorTabType>('config');

  const handleTabTypeChange = React.useCallback(() => {
    setTabType((prev) => (prev === 'config' ? 'settings' : 'config'));
  }, []);

  return dataSourceId && dataSource && queryEditorContext ? (
    <ConnectionContextProvider value={queryEditorContext}>
      <Box sx={{ height: '100%', p: 0, overflow: 'hidden' }}>
        {draft && runtimeConfigFetchStatus === 'success' ? (
          <dataSource.QueryEditor
            connectionParams={connectionParams}
            value={draft}
            globalScope={pageState}
            globalScopeMeta={globalScopeMeta}
            execApi={execPrivate}
            tabType={tabType}
            settingsToggle={
              <QuerySettingsToggleButton
                tabType={tabType}
                handleTabTypeChange={handleTabTypeChange}
              />
            }
            runtimeConfig={runtimeConfig}
            settingsTab={
              <QuerySettingsTab
                {...{
                  liveEnabled,
                  pageState,
                  globalScopeMeta,
                  jsBrowserRuntime,
                }}
              />
            }
          />
        ) : null}
      </Box>
    </ConnectionContextProvider>
  ) : (
    <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
  );
}
