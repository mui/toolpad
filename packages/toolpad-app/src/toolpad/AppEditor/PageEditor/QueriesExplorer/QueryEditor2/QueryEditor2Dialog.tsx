import {
  Stack,
  // Button,
  TextField,
  InputAdornment,
  // Divider,
  Alert,
  // Box,
  Tab,
  MenuItem,
} from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, NodeId } from '@mui/toolpad-core';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import invariant from 'invariant';
// import useLatest from '../../../../../utils/useLatest';
import { usePageEditorState } from '../../PageEditorProvider';
import * as appDom from '../../../../../appDom';
import dataSources from '../../../../../toolpadDataSources/client';
import { omit, update } from '../../../../../utils/immutability';
import { useEvaluateLiveBinding } from '../../../useEvaluateLiveBinding';
import { useDom } from '../../../../AppState';
import { ConnectionContextProvider } from '../../../../../toolpadDataSources/context';
// import ConnectionSelect, { ConnectionOption } from '../../ConnectionSelect';
import BindableEditor from '../../BindableEditor';
// import { ConfirmDialog } from '../../../../../components/SystemDialogs';
// import useBoolean from '../../../../../utils/useBoolean';
// import { useNodeNameValidation } from '../../../HierarchyExplorer/validation';
// import useEvent from '../../../../../utils/useEvent';
// import useUnsavedChangesConfirm from '../../../../hooks/useUnsavedChangesConfirm';
import client from '../../../../../api';

// interface QueryEditorActionsProps {
//   saveDisabled?: boolean;
//   onSave?: () => void;
//   onRemove?: () => void;
//   isDraft?: boolean;
//   onClose?: () => void;
// }

// function QueryEditorActions({
//   saveDisabled,
//   onSave,
//   onRemove,
//   onClose,
//   isDraft,
// }: QueryEditorActionsProps) {
//   const {
//     value: removeConfirmOpen,
//     setTrue: handleRemoveConfirmOpen,
//     setFalse: handleRemoveConfirmclose,
//   } = useBoolean(false);

//   const handleRemoveConfirm = React.useCallback(
//     (confirmed: boolean) => {
//       handleRemoveConfirmclose();
//       if (confirmed) {
//         onRemove?.();
//       }
//     },
//     [handleRemoveConfirmclose, onRemove],
//   );

//   return (
//     <Box>
//       <Button color="inherit" variant="text" onClick={onClose}>
//         Cancel
//       </Button>
//       <Button onClick={handleRemoveConfirmOpen} disabled={isDraft}>
//         Remove
//       </Button>
//       <ConfirmDialog open={removeConfirmOpen} onClose={handleRemoveConfirm} severity="error">
//         Are you sure your want to remove this query?
//       </ConfirmDialog>
//       <Button disabled={saveDisabled} onClick={onSave}>
//         Save
//       </Button>
//     </Box>
//   );
// }

function refetchIntervalInSeconds(maybeInterval?: number) {
  if (typeof maybeInterval !== 'number') {
    return undefined;
  }
  const seconds = Math.floor(maybeInterval / 1000);
  return seconds > 0 ? seconds : undefined;
}

interface QueryNodeEditorProps {
  // onSave?: (newNode: appDom.QueryNode) => void;
  // onRemove?: (nodeId: NodeId) => void;
  nodeId: NodeId;
}

export default function QueryEditorPanel<Q>({ nodeId }: QueryNodeEditorProps) {
  const { dom } = useDom();

  const node = appDom.getNode(dom, nodeId, 'query');

  const [tab, setTab] = React.useState('config');
  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  }, []);

  // To keep it around during closing animation
  // const node = useLatest(nodeProp);

  const [input, setInput] = React.useState<appDom.QueryNode<Q>>(node);
  React.useEffect(() => {
    setInput(node);
  }, [node]);

  // const reset = useEvent(() => setInput(node));

  // React.useEffect(() => {
  //   if (open) {
  //     reset();
  //   }
  // }, [open, reset]);

  const connectionId = input.attributes.connectionId
    ? appDom.deref(input.attributes.connectionId)
    : null;

  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const dataSourceId = input.attributes.dataSource || null;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes.params;

  // const handleCommit = React.useCallback(() => {
  //   let toCommit: appDom.QueryNode<Q> = input;
  //   if (dataSource?.transformQueryBeforeCommit) {
  //     toCommit = {
  //       ...input,
  //       attributes: {
  //         ...input.attributes,
  //         query: dataSource.transformQueryBeforeCommit(input.attributes.query),
  //       },
  //     };
  //   }
  //   onSave(toCommit);
  // }, [dataSource, input, onSave]);

  const { pageState, globalScopeMeta } = usePageEditorState();

  // const handleConnectionChange = React.useCallback(
  //   (newConnectionOption: ConnectionOption | null) => {
  //     if (newConnectionOption) {
  //       setInput((existing) =>
  //         update(existing, {
  //           attributes: update(existing.attributes, {
  //             connectionId: appDom.ref(newConnectionOption.connectionId),
  //             dataSource: newConnectionOption.dataSourceId,
  //           }),
  //         }),
  //       );
  //     } else {
  //       setInput((existing) =>
  //         update(existing, {
  //           attributes: update(existing.attributes, {
  //             connectionId: undefined,
  //             dataSource: undefined,
  //           }),
  //         }),
  //       );
  //     }
  //   },
  //   [],
  // );

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

  // const handleRemove = React.useCallback(() => {
  //   if (!isDraft) {
  //     onRemove(node.id);
  //   }
  //   onClose();
  // }, [isDraft, onClose, onRemove, node]);

  // const isInputSaved = !isDraft && node === input;

  // const { handleCloseWithUnsavedChanges } = useUnsavedChangesConfirm({
  //   hasUnsavedChanges: !isInputSaved,
  //   onClose,
  // });

  // const handleSave = React.useCallback(() => {
  //   handleCommit();
  //   onClose();
  // }, [handleCommit, onClose]);

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

  // const existingNames = React.useMemo(
  //   () => appDom.getExistingNamesForNode(dom, input),
  //   [dom, input],
  // );

  // const nodeNameError = useNodeNameValidation(input.name, existingNames, 'query');
  // const isNameValid = !nodeNameError;

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
          {/* <Stack direction="row" gap={2}>
        <ConnectionSelect
          dataSource={dataSourceId}
          value={
            input.attributes.dataSource
              ? {
                  connectionId: appDom.deref(input.attributes.connectionId) || null,
                  dataSourceId: input.attributes.dataSource,
                }
              : null
          }
          onChange={handleConnectionChange}
        />
      </Stack> */}
          {/* <Divider /> */}

          {/* <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
        }}
      > */}
          <dataSource.QueryEditor
            connectionParams={connectionParams}
            value={input}
            onChange={setInput}
            // onCommit={handleCommit}
            globalScope={pageState}
            globalScopeMeta={globalScopeMeta}
            execApi={execPrivate}
          />
          {/* </Box> */}
        </TabPanel>
        <TabPanel value="settings" sx={{ p: 0 }}>
          <Stack direction="row" alignItems="center" sx={{ pt: 2, px: 3, gap: 2 }}>
            <TextField select label="mode" value={mode} onChange={handleModeChange}>
              <MenuItem value="query">
                Fetch at any time to always be available on the page
              </MenuItem>
              <MenuItem value="mutation">Only fetch on manual action</MenuItem>
            </TextField>
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
            />
            <TextField
              InputProps={{
                startAdornment: <InputAdornment position="start">s</InputAdornment>,
              }}
              sx={{ maxWidth: 300 }}
              type="number"
              label="Refetch interval"
              value={refetchIntervalInSeconds(input.attributes.refetchInterval) ?? ''}
              onChange={handleRefetchIntervalChange}
              disabled={mode !== 'query'}
            />
          </Stack>
        </TabPanel>
      </TabContext>
      {/* <QueryEditorActions
        onSave={handleSave}
        onClose={onClose}
        onRemove={handleRemove}
        isDraft={isDraft}
        saveDisabled={isInputSaved || !isNameValid}
      /> */}
    </ConnectionContextProvider>
  ) : (
    <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
  );
}
