import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { Box, Chip, Tab } from '@mui/material';
import { LoadingButton, TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrow from '@mui/icons-material/PlayArrow';
import * as appDom from '../../../../../appDom';
import { useAppState, useAppStateApi, useDomApi } from '../../../../AppState';
import QueryIcon from '../../../QueryIcon';
import QueryEditorPanel from './QueryEditor2Dialog';
import QueryToolsContext, { QueryToolsContextProps } from './QueryToolsContext';
import { QueryEditorToolsTab } from '../../../../../types';
import { PAGE_PANEL_WIDTH } from '../../../../../constants';

function TabCloseIcon({ queryIndex, queryId }: { queryIndex?: number; queryId?: NodeId }) {
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();
  const unsaved = React.useMemo(() => {
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
  }, [currentView, queryIndex]);
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
          theme.palette.mode === 'dark' ? theme.palette.primaryDark[300] : theme.palette.grey[500],
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

  const [toolsTab, setToolsTab] = React.useState<QueryEditorToolsTab>('preview');

  const handleToolsTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: QueryEditorToolsTab) => setToolsTab(newValue),
    [],
  );

  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  const [handleRunPreview, setHandleRunPreview] = React.useState(() => () => {});

  const queryToolsContext = React.useMemo<QueryToolsContextProps>(
    () => ({
      toolsTab,
      handleToolsTabChange,
      isPreviewLoading,
      setIsPreviewLoading,
      handleRunPreview,
      setHandleRunPreview,
    }),
    [
      toolsTab,
      handleToolsTabChange,
      isPreviewLoading,
      setIsPreviewLoading,
      handleRunPreview,
      setHandleRunPreview,
    ],
  );

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
      }
    },
    [appStateApi, currentView],
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

  return currentView.kind === 'page' &&
    currentView.view?.kind === 'query' &&
    currentQueryId &&
    currentView?.queryPanel?.queryTabs ? (
    <Box
      sx={{
        left: PAGE_PANEL_WIDTH,
        width: '100%',
        height: '100%',
        overflow: 'scroll',
      }}
    >
      <TabContext value={currentTabIndex}>
        <QueryToolsContext.Provider value={queryToolsContext}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <TabList
              onChange={handleTabChange}
              aria-label="Query editor panel"
              sx={{ maxHeight: 36 }}
            >
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
                      deleteIcon={<TabCloseIcon queryIndex={index} queryId={query?.meta?.id} />}
                      onDelete={() => {}}
                    />
                  }
                  icon={
                    <QueryIcon
                      id={query?.meta?.dataSource || 'default'}
                      sx={{ fontSize: 24, mt: 0.2 }}
                    />
                  }
                  iconPosition="start"
                  value={index.toString()}
                />
              ))}
            </TabList>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'end',
              borderBottom: 1,
              borderColor: 'divider',
              height: 40,
            }}
          >
            <LoadingButton
              disabled={isPreviewLoading || toolsTab !== 'preview'}
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
              onClick={handleSave}
              variant="contained"
              color="primary"
              sx={{ width: 'fit-content', height: 32, my: 'auto', mr: 2 }}
            >
              Save
            </LoadingButton>
          </Box>
          {currentView.queryPanel?.queryTabs?.map((query, index) => {
            if (query && query.draft) {
              return (
                <TabPanel
                  key={query.meta?.name}
                  value={index.toString()}
                  sx={{ p: 0, overflow: 'scroll', height: '100%' }}
                >
                  <QueryEditorPanel draft={query.draft} saved={query.saved} />
                </TabPanel>
              );
            }
            return null;
          })}
        </QueryToolsContext.Provider>
      </TabContext>
    </Box>
  ) : null;
}
