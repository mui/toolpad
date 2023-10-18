import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { Box, Stack, Chip, Tab, IconButton } from '@mui/material';
import { LoadingButton, TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrow from '@mui/icons-material/PlayArrow';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import * as appDom from '../../../../appDom';
import { useAppState, useAppStateApi, useDomApi } from '../../../AppState';
import QueryIcon from '../../QueryIcon';
import QueryEditorPanel from './QueryEditorPanel';
import useShortcut from '../../../../utils/useShortcut';
import { isMac } from '../../../../utils/platform';
import QueryToolsContext, { QueryToolsContextProps } from './QueryToolsContext';
import { QueryEditorToolsTabType } from '../../../../types';

function SaveShortcutIndicator() {
  return <span style={{ opacity: 0.55, marginLeft: 6 }}>{isMac() ? '⌘' : <kbd>Ctrl</kbd>}S</span>;
}

function TabCloseIcon({
  queryIndex,
  unsaved,
  queryId,
}: {
  queryIndex?: number;
  unsaved?: boolean;
  queryId?: NodeId;
}) {
  const appStateApi = useAppStateApi();

  const [notHovered, setNotHovered] = React.useState(true);

  const onClose = React.useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      // Prevent the tab from being selected.
      event.stopPropagation();
      if (queryIndex === undefined || queryId === undefined) {
        return;
      }
      appStateApi.closeQueryTab(queryIndex, queryId);
    },
    [appStateApi, queryIndex, queryId],
  );
  return unsaved && notHovered ? (
    <CircleIcon
      sx={{
        color: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.primaryDark[300]
            : theme.palette.primary.main,
        fontSize: 12,
      }}
      onMouseEnter={() => {
        setNotHovered(false);
      }}
    />
  ) : (
    <ClearOutlinedIcon
      onMouseLeave={() => {
        setNotHovered(true);
      }}
      onClick={onClose}
      sx={{
        color: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[500],
        fontSize: 12,
        padding: '1px',
        '&:hover': {
          color: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.primaryDark[300]
              : theme.palette.grey[700],
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.primaryDark[700]
              : theme.palette.grey[300],
          borderRadius: '4px',
        },
      }}
    />
  );
}

export default function QueryEditor() {
  const { dom, currentView } = useAppState();
  const domApi = useDomApi();
  const appStateApi = useAppStateApi();

  const currentQueryId = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.view.nodeId;
    }
    return '';
  }, [currentView]);

  const currentTabIndex = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.queryPanel?.currentTabIndex?.toString() || '';
    }
    return '';
  }, [currentView]);

  const [toolsTabType, setToolsTabType] = React.useState<QueryEditorToolsTabType>('preview');

  const handleToolsTabTypeChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: QueryEditorToolsTabType) => setToolsTabType(newValue),
    [],
  );

  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  const [handleRunPreview, setHandleRunPreview] = React.useState(() => () => {});

  const queryToolsContext = React.useMemo<QueryToolsContextProps>(
    () => ({
      toolsTabType,
      handleToolsTabTypeChange,
      isPreviewLoading,
      setIsPreviewLoading,
      handleRunPreview,
      setHandleRunPreview,
    }),
    [
      toolsTabType,
      handleToolsTabTypeChange,
      isPreviewLoading,
      setIsPreviewLoading,
      handleRunPreview,
      setHandleRunPreview,
    ],
  );

  const refreshQueryToolsContext = React.useCallback(() => {
    setToolsTabType('preview');
    setIsPreviewLoading(false);
  }, []);

  const handleTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      if (currentView.kind === 'page') {
        const tabIndex = parseInt(newValue, 10);
        const queryId = currentView.queryPanel?.queryTabs?.[tabIndex]?.meta?.id;
        if (queryId) {
          appStateApi.setView({
            kind: 'page',
            nodeId: currentView.nodeId,
            view: { kind: 'query', nodeId: queryId },
            queryPanel: {
              ...currentView.queryPanel,
              currentTabIndex: tabIndex,
            },
          });
        }
        refreshQueryToolsContext();
      }
    },
    [appStateApi, currentView, refreshQueryToolsContext],
  );

  const hasUnsavedChanges = React.useCallback(
    (queryIndex: number) => {
      if (
        currentView.kind !== 'page' ||
        !currentView.nodeId ||
        !currentView.queryPanel?.queryTabs ||
        queryIndex === undefined
      ) {
        return false;
      }
      const tab = currentView.queryPanel?.queryTabs[queryIndex];
      const draft = tab?.draft;
      if (!tab || !tab.meta?.id || !draft) {
        return false;
      }
      return draft !== tab.saved;
    },
    [currentView],
  );

  const handleSave = React.useCallback(() => {
    if (
      currentView.kind !== 'page' ||
      !currentView.nodeId ||
      !currentView.queryPanel?.queryTabs ||
      currentView.queryPanel?.currentTabIndex === undefined
    ) {
      return;
    }
    const currentTab = currentView.queryPanel?.queryTabs[currentView.queryPanel?.currentTabIndex];
    const currentQueryDraft = currentTab?.draft;
    if (!currentTab || !currentTab.meta?.id || !currentQueryDraft) {
      return;
    }
    appStateApi.saveQueryDraft(currentQueryDraft);
    const page = appDom.getNode(dom, currentView.nodeId, 'page');
    if (appDom.nodeExists(dom, currentTab.meta.id)) {
      domApi.saveNode(currentQueryDraft);
    } else {
      appStateApi.update((draft) => appDom.addNode(draft, currentQueryDraft, page, 'queries'));
    }
  }, [dom, domApi, appStateApi, currentView]);

  const onClosePanel = React.useCallback(() => {
    appStateApi.closeQueryPanel();
  }, [appStateApi]);

  const saveDisabled = React.useMemo(
    () => !hasUnsavedChanges(parseInt(currentTabIndex, 10)),
    [hasUnsavedChanges, currentTabIndex],
  );

  useShortcut({ key: 's', metaKey: true, disabled: saveDisabled }, handleSave);

  return currentView.kind === 'page' &&
    currentView.view?.kind === 'query' &&
    currentQueryId &&
    currentView?.queryPanel?.queryTabs ? (
    <Stack
      direction="column"
      sx={{ height: '100%', overflow: 'hidden', borderBottom: 5, borderColor: 'divider' }}
    >
      <TabContext value={currentTabIndex}>
        <QueryToolsContext.Provider value={queryToolsContext}>
          <Stack direction="column">
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              sx={{ maxHeight: 40, borderBottom: 1, borderColor: 'divider' }}
            >
              <TabList onChange={handleTabChange} aria-label="Query editor panel">
                {currentView.queryPanel?.queryTabs?.map((query, index) => (
                  <Tab
                    key={query?.meta?.name}
                    label={
                      <Chip
                        label={query?.meta?.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: 'inherit',
                          border: 0,
                          ml: -1,
                          '&:hover': { color: 'inherit' },
                        }}
                        deleteIcon={
                          <TabCloseIcon
                            queryIndex={index}
                            unsaved={hasUnsavedChanges(index)}
                            queryId={query?.meta?.id}
                          />
                        }
                        // Need to pass onDelete to allow the delete icon to be rendered
                        onDelete={() => {}}
                      />
                    }
                    value={index.toString()}
                    icon={
                      <QueryIcon
                        id={query?.meta?.dataSource || 'default'}
                        sx={{ fontSize: 24, mt: 0.2 }}
                      />
                    }
                    iconPosition="start"
                  />
                ))}
              </TabList>
              <IconButton size="small" disableRipple onClick={onClosePanel}>
                <CancelPresentationIcon
                  sx={{
                    mr: 1,
                    alignSelf: 'center',
                    color: (theme) => theme.palette.grey[500],
                    transition: (theme) =>
                      theme.transitions.create('color', {
                        duration: theme.transitions.duration.shortest,
                      }),
                    '&:hover, &:focus': {
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.primaryDark[300]
                          : theme.palette.primary.main,
                    },
                    fontSize: 16,
                  }}
                />
              </IconButton>
            </Stack>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                minHeight: 60,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <LoadingButton
                disabled={isPreviewLoading}
                loading={isPreviewLoading}
                variant="outlined"
                color="primary"
                onClick={handleRunPreview}
                endIcon={<PlayArrow />}
                sx={{
                  width: 'fit-content',
                  height: 32,
                  mr: 1,
                  my: 'auto',
                  alignSelf: 'center',
                }}
              >
                Preview
              </LoadingButton>
              <LoadingButton
                disabled={saveDisabled}
                onClick={handleSave}
                variant="contained"
                color="primary"
                sx={{ width: 'fit-content', height: 32, my: 'auto', mr: 2 }}
              >
                Save <SaveShortcutIndicator />
              </LoadingButton>
            </Box>
          </Stack>

          {currentView.queryPanel?.queryTabs?.map((query, index) => {
            if (query && query.draft) {
              return (
                <TabPanel
                  key={query.meta?.name}
                  value={index.toString()}
                  sx={{
                    p: 1,
                    pb: 0,
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <QueryEditorPanel draft={query.draft} saved={query.saved} />
                </TabPanel>
              );
            }
            return null;
          })}
        </QueryToolsContext.Provider>
      </TabContext>
    </Stack>
  ) : null;
}
