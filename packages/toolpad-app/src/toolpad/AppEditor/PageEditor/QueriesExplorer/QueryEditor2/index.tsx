import * as React from 'react';
// import invariant from 'invariant';
import {
  // Stack,
  Box,
  Chip,
  Paper,
  // Button,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  Tab,
} from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import { TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

// import * as appDom from '../../../../../appDom';
// import dataSources from '../../../../../toolpadDataSources/client';
// import { useDom, useAppStateApi } from '../../../../AppState';
import { useAppStateApi } from '../../../../AppState';
import QueryIcon from '../../../QueryIcon';
import QueryEditorPanel from './QueryEditor2Dialog';
import { DomView } from '../../../../../utils/domView';
import { QueryMeta, PanelState } from '../types';
import { COMPONENT_CATALOG_WIDTH_COLLAPSED } from '../../ComponentCatalog/ComponentCatalog';

// interface DataSourceSelectorProps<Q> {
//   open: boolean;
//   onClose: () => void;
//   onCreated: (newNode: appDom.QueryNode<Q>) => void;
// }

// function ConnectionSelectorDialog<Q>({ open, onCreated, onClose }: DataSourceSelectorProps<Q>) {
//   const { dom } = useDom();

//   const handleCreateClick = React.useCallback(
//     (dataSourceId: string) => () => {
//       const dataSource = dataSources[dataSourceId];
//       invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);

//       const queryNode = appDom.createNode(dom, 'query', {
//         attributes: {
//           query: dataSource.getInitialQueryValue(),
//           connectionId: null,
//           dataSource: dataSourceId,
//         },
//       });

//       onCreated(queryNode);
//     },
//     [dom, onCreated],
//   );

//   return (
//     <Dialog open={open} onClose={onClose} scroll="body">
//       <DialogTitle>Create Query</DialogTitle>
//       <DialogContent>
//         <Stack direction="row" gap={1}>
//           <Button onClick={handleCreateClick('local')}>Local function</Button>
//           <Button onClick={handleCreateClick('rest')}>Fetch</Button>
//         </Stack>
//       </DialogContent>
//       <DialogActions>
//         <Button color="inherit" variant="text" onClick={onClose}>
//           Cancel
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

type QueryEditorProps = {
  tabs: React.MutableRefObject<Map<NodeId, QueryMeta>>;
  currentQueryId: NodeId | '';
  currentPageId: NodeId | undefined;
  panelState: PanelState | null;
  handleTabRemove: (
    queryId: NodeId,
    onRemove?: (viewOptions: DomView, nodeId?: NodeId) => void,
  ) => void;
};

export default function QueryEditor({
  tabs,
  currentQueryId,
  currentPageId,
  panelState,
  handleTabRemove,
}: QueryEditorProps) {
  const appStateApi = useAppStateApi();

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
        nodeId: currentPageId,
        view: { kind: 'query', nodeId: newValue },
      });
    },
    [appStateApi, currentPageId],
  );

  return panelState?.node?.id ? (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 250 + COMPONENT_CATALOG_WIDTH_COLLAPSED,
        width: '100%',
      }}
    >
      <Paper square elevation={0} sx={{ minHeight: '30vh', maxHeight: '30vh' }}>
        <TabContext value={panelState.node.id}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleTabChange}
              aria-label="Query editor panel"
              sx={{ maxHeight: 36 }}
            >
              {Array.from(tabs.current).map(([queryId, meta]) => (
                <Tab
                  key={queryId}
                  label={
                    <Chip
                      label={meta.name}
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
                      onDelete={() => {
                        handleTabRemove(queryId, onRemove);
                      }}
                    />
                  }
                  icon={
                    <QueryIcon id={meta.dataSource || 'default'} sx={{ fontSize: 24, mt: 0.2 }} />
                  }
                  iconPosition="start"
                  value={queryId}
                />
              ))}
            </TabList>
          </Box>
          {Array.from(tabs.current).map(([queryId]) => (
            <TabPanel
              key={queryId}
              value={queryId as string}
              sx={{ p: 0, overflow: 'scroll', minHeight: '26vh', maxHeight: '26vh' }}
            >
              <QueryEditorPanel nodeId={currentQueryId as NodeId} />
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </Box>
  ) : null;
}
