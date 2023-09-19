import * as React from 'react';

import { Box, Chip, Paper, Tab } from '@mui/material';
import { LoadingButton, TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import * as appDom from '../../../../../appDom';
import { useAppState, useAppStateApi, useDomApi } from '../../../../AppState';
import QueryIcon from '../../../QueryIcon';
import QueryEditorPanel from './QueryEditor2Dialog';
import { PAGE_PANEL_WIDTH } from '../../../../../constants';

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
    const page = appDom.getNode(dom, currentView.nodeId, 'page');
    if (appDom.nodeExists(dom, currentTab.meta.id)) {
      domApi.saveNode(currentQueryDraft);
    } else {
      appStateApi.update((draft) => appDom.addNode(draft, currentQueryDraft, page, 'queries'));
    }
    appStateApi.saveQueryDraft(currentQueryDraft);
  }, [dom, domApi, appStateApi, currentView]);

  return currentView.kind === 'page' && currentView.view?.kind === 'query' && currentQueryId ? (
    <Box
      sx={{
        left: PAGE_PANEL_WIDTH,
        width: '100%',
        height: '100%',
        overflow: 'scroll',
      }}
    >
      <Paper square elevation={0} sx={{ height: '100%' }}>
        <TabContext value={currentTabIndex}>
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
              sx={{ maxHeight: 48 }}
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
                        '& .MuiChip-deleteIcon': {
                          color: (theme) =>
                            theme.palette.mode === 'dark'
                              ? theme.palette.primaryDark[300]
                              : theme.palette.grey[500],
                          fontSize: 12,
                          transition: (theme) =>
                            theme.transitions.create('color', {
                              duration: theme.transitions.duration.shorter,
                            }),
                          '&:hover': {
                            color: (theme) =>
                              theme.palette.mode === 'dark'
                                ? theme.palette.primaryDark[500]
                                : theme.palette.grey[700],
                          },
                        },
                      }}
                      deleteIcon={<ClearOutlinedIcon />}
                      // onDelete={() => {
                      //   handleTabRemove(queryId, onRemove);
                      // }}
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
            <LoadingButton
              onClick={handleSave}
              variant="contained"
              color="primary"
              sx={{ width: 'fit-content', height: 32, mr: 1, alignSelf: 'center' }}
            >
              Save
            </LoadingButton>
          </Box>
          {currentView.queryPanel?.queryTabs?.map((query, index) => {
            if (query && query.saved) {
              return (
                <TabPanel
                  key={query.meta?.name}
                  value={index.toString()}
                  sx={{ p: 0, overflow: 'scroll', height: '100%' }}
                >
                  <QueryEditorPanel input={query.saved} />
                </TabPanel>
              );
            }
            return null;
          })}
        </TabContext>
      </Paper>
    </Box>
  ) : null;
}
