import * as React from 'react';

import { Box, Chip, Paper, Tab } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import { TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import * as appDom from '../../../../../appDom';
import { useDom, useAppState, useAppStateApi, useDomApi } from '../../../../AppState';
import QueryIcon from '../../../QueryIcon';
import QueryEditorPanel from './QueryEditor2Dialog';
import { DomView } from '../../../../../utils/domView';
import { PAGE_PANEL_WIDTH } from '../../../../../constants';

// type QueryEditorProps = {
//   tabs: React.MutableRefObject<Map<NodeId, QueryMeta>>;
//   currentQueryId: NodeId | '';
//   currentPageId: NodeId | undefined;
//   panelState: PanelState | null;
//   handleTabRemove: (
//     queryId: NodeId,
//     onRemove?: (viewOptions: DomView, nodeId?: NodeId) => void,
//   ) => void;
// };

export default function QueryEditor() {
  const { dom } = useDom();
  const domApi = useDomApi();
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();

  React.useEffect(() => {
    console.log('currentView', currentView);
  }, [currentView]);

  const onRemove = React.useCallback(
    (viewOptions: DomView) => {
      appStateApi.setView(viewOptions);
    },
    [appStateApi],
  );

  const handleTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: NodeId) => {
      appStateApi.setView({
        kind: 'page',
        nodeId: currentView.nodeId,
        view: { kind: 'query', nodeId: newValue },
      });
    },
    [appStateApi, currentView],
  );

  const handleSave = React.useCallback(
    (node: appDom.QueryNode) => {
      if (currentView.kind !== 'page' || !currentView.nodeId) {
        return;
      }
      const page = appDom.getNode(dom, currentView.nodeId, 'page');
      if (appDom.nodeExists(dom, node.id)) {
        domApi.saveNode(node);
      } else {
        appStateApi.update((draft) => appDom.addNode(draft, node, page, 'queries'));
      }
    },
    [dom, domApi, appStateApi, currentView],
  );

  const currentQueryId = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.view.nodeId;
    }
    return '';
  }, [currentView]);

  return currentView.kind === 'page' && currentView.view?.kind === 'query' && currentQueryId ? (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: PAGE_PANEL_WIDTH,
        width: '100%',
        zIndex: 1000,
      }}
    >
      <Paper square elevation={0} sx={{ minHeight: '30vh', maxHeight: '30vh' }}>
        <TabContext value={currentQueryId}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleTabChange}
              aria-label="Query editor panel"
              sx={{ maxHeight: 36 }}
            >
              {currentView.view?.queryPanel?.queryTabs?.map((queryMeta) => (
                <Tab
                  key={queryMeta?.saved?.id}
                  label={
                    <Chip
                      label={queryMeta.name}
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
                      id={queryMeta.dataSource || 'default'}
                      sx={{ fontSize: 24, mt: 0.2 }}
                    />
                  }
                  iconPosition="start"
                  value={queryMeta?.saved?.id}
                />
              ))}
            </TabList>
          </Box>
          {currentView.view?.queryPanel?.queryTabs?.map((queryMeta) => (
            <TabPanel
              key={queryMeta?.saved?.id}
              value={queryMeta?.saved?.id || ''}
              sx={{ p: 0, overflow: 'scroll', minHeight: '26vh', maxHeight: '26vh' }}
            >
              <QueryEditorPanel nodeId={currentQueryId} onSave={handleSave} />
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </Box>
  ) : null;
}
