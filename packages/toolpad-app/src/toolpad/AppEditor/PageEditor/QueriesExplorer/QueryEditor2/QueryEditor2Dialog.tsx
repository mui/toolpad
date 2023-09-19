import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  MenuItem,
  Fade,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import * as React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import { BindableAttrValue } from '@mui/toolpad-core';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import invariant from 'invariant';

import { usePageEditorState } from '../../PageEditorProvider';
import * as appDom from '../../../../../appDom';
import dataSources from '../../../../../toolpadDataSources/client';
import { useEvaluateLiveBinding } from '../../../useEvaluateLiveBinding';
import { useAppState, useAppStateApi } from '../../../../AppState';
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
  // onSave: (newNode: appDom.QueryNode) => void;
  // onRemove?: (nodeId: NodeId) => void;
  input: appDom.QueryNode;
}

export default function QueryEditorPanel<Q>({ input }: QueryNodeEditorProps) {
  const { dom } = useAppState();
  const appStateApi = useAppStateApi();

  const [tab, setTab] = React.useState('config');

  const handleTabChange = React.useCallback(() => {
    setTab((prev) => (prev === 'config' ? 'settings' : 'config'));
  }, []);

  const [draft, setDraft] = React.useState<appDom.QueryNode<Q>>(input);

  React.useEffect(() => {
    if (draft) {
      console.log('updating draft', draft);
      appStateApi.setQueryDraft(draft);
    }
  }, [appStateApi, draft]);

  const connectionId = appDom.deref(input?.attributes?.connectionId) ?? null;

  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const dataSourceId = input?.attributes?.dataSource || null;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes?.params;

  const { pageState, globalScopeMeta } = usePageEditorState();

  const handleModeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => {
      if (prev && prev.attributes && prev.attributes.query) {
        return {
          ...prev,
          attributes: {
            ...prev?.attributes,
            mode: event.target.value as any,
          },
        };
      }
      return prev;
    });
  }, []);

  const handleEnabledChange = React.useCallback((newValue: BindableAttrValue<boolean> | null) => {
    setDraft((prev) => {
      if (prev && prev.attributes && prev.attributes.query && typeof newValue === 'boolean') {
        return {
          ...prev,
          attributes: {
            ...prev?.attributes,
            enabled: newValue,
          },
        };
      }
      return prev;
    });
  }, []);

  const handleRefetchIntervalChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const interval = Number(event.target.value);

      setDraft((prev) => {
        if (
          prev &&
          prev.attributes &&
          prev.attributes.query &&
          !Number.isNaN(interval) &&
          interval > 0
        ) {
          return {
            ...prev,
            attributes: {
              ...prev?.attributes,
              refetchInterval: interval * 1000,
            },
          };
        }
        return prev;
      });
    },
    [],
  );

  const queryEditorContext = React.useMemo(
    () => (dataSourceId ? { dataSourceId, connectionId } : null),
    [dataSourceId, connectionId],
  );

  const jsBrowserRuntime = useBrowserJsRuntime();

  const liveEnabled = useEvaluateLiveBinding({
    jsRuntime: jsBrowserRuntime,
    input: input?.attributes?.enabled || null,
    globalScope: pageState,
  });

  const mode = input?.attributes?.mode || 'query';

  const execPrivate = React.useCallback(
    (method: string, args: any[]) => {
      invariant(dataSourceId, 'dataSourceId must be set');
      return client.mutation.dataSourceExecPrivate(dataSourceId, method, args);
    },
    [dataSourceId],
  );

  return dataSourceId && dataSource && queryEditorContext ? (
    <ConnectionContextProvider value={queryEditorContext}>
      <Box position={'relative'} height={'100%'}>
        {tab === 'config' ? (
          <Fade in={tab === 'config'} style={{ height: '100%' }}>
            <div>
              {draft ? (
                <dataSource.QueryEditor
                  connectionParams={connectionParams}
                  value={draft}
                  onChange={setDraft}
                  globalScope={pageState}
                  globalScopeMeta={globalScopeMeta}
                  execApi={execPrivate}
                />
              ) : null}
            </div>
          </Fade>
        ) : null}
        {tab === 'settings' ? (
          <Fade in={tab === 'settings'}>
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
                value={refetchIntervalInSeconds(input?.attributes?.refetchInterval) ?? ''}
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
                value={input?.attributes?.enabled ?? true}
                onChange={handleEnabledChange}
                disabled={mode !== 'query'}
                sx={{ maxWidth: 100 }}
              />
            </Stack>
          </Fade>
        ) : null}
        <Tooltip
          title={tab === 'config' ? 'Show query settings' : 'Show query editor'}
          placement="bottom"
        >
          <IconButton
            color="primary"
            aria-label="toggle query settings editor"
            size="small"
            onClick={handleTabChange}
            sx={{
              position: 'absolute',
              top: 18,
              left: '50%',
              transform: 'translateX(-120%)',
            }}
          >
            {tab === 'config' ? <SettingsIcon /> : <DynamicFormIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </ConnectionContextProvider>
  ) : (
    <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
  );
}
