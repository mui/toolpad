import * as React from 'react';
import clsx from 'clsx';
import { NodeId } from '@mui/toolpad-core';
import {
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as appDom from '../../../appDom';
import { useDom, useAppState, useAppStateApi } from '../../AppState';
import NodeMenu from '../NodeMenu';

const classes = {
  listItemMenuButton: 'Toolpad__QueryListItem',
  listItemMenuOpen: 'Toolpad__QueryListItemMenuOpen',
};

const QueryListItem = styled(ListItem)({
  [`& .${classes.listItemMenuButton}`]: {
    visibility: 'hidden',
  },
  [`
      &:hover .${classes.listItemMenuButton}, 
      & .${classes.listItemMenuOpen}
    `]: {
    visibility: 'visible',
  },
});

export function QueriesExplorer() {
  const { dom } = useDom();
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();
  const currentPageId = currentView.nodeId;

  const queries = React.useMemo(() => {
    if (!currentPageId) {
      return [];
    }
    if (currentPageId) {
      const currentPageNode = appDom.getNode(dom, currentPageId, 'page');
      if (currentPageNode) {
        return appDom.getChildNodes(dom, currentPageNode).queries ?? [];
      }
    }
    return [];
  }, [currentPageId, dom]);

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId) => {
      appStateApi.update((draft) => appDom.removeNode(draft, nodeId), {
        kind: 'page',
        nodeId: currentPageId,
      });
    },
    [appStateApi, currentPageId],
  );

  return (
    <React.Fragment>
      <Typography
        variant="body2"
        sx={(theme) => ({
          flexGrow: 1,
          fontWeight: theme.typography.fontWeightLight,
          mx: 1,
          my: 0.5,
        })}
      >
        Components
      </Typography>
      <List sx={{ width: '100%' }}>
        {queries.map((queryNode) => {
          return (
            <QueryListItem
              key={queryNode?.id}
              disablePadding
              onClick={() => {
                appStateApi.setView({
                  kind: 'page',
                  nodeId: currentPageId,
                  view: { kind: 'query', nodeId: queryNode?.id },
                });
              }}
              secondaryAction={
                <NodeMenu
                  renderButton={({ buttonProps, menuProps }) => (
                    <IconButton
                      className={clsx(classes.listItemMenuButton, {
                        [classes.listItemMenuOpen]: menuProps.open,
                      })}
                      edge="end"
                      aria-label="Open query menu"
                      {...buttonProps}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  nodeId={queryNode.id}
                  deleteLabelText="Delete"
                  duplicateLabelText="Duplicate"
                  onDeleteNode={handleDeleteNode}
                  // onDuplicateNode={handleDuplicateNode}
                />
              }
            >
              <ListItemButton>
                <ListItemText primaryTypographyProps={{ noWrap: true }} primary={queryNode.name} />
              </ListItemButton>
            </QueryListItem>
          );
        })}
      </List>
    </React.Fragment>
  );
}
