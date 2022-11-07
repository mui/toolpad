import {
  styled,
  SxProps,
  Typography,
  Tooltip,
  Skeleton,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  DialogTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import * as React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HierarchyExplorer from './HierarchyExplorer';
import client from '../../api';
import { useDom } from '../DomLoader';
import JsonView from '../../components/JsonView';
import useMenu from '../../utils/useMenu';
import useLocalStorageState from '../../utils/useLocalStorageState';
import { LatestStoredAppValue, TOOLPAD_LATEST_APP_KEY } from '../../storageKeys';

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

function AppMenu() {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const dialogTitleId = React.useId();

  const [viewDomDialogOpen, setViewDomDialogOpen] = React.useState(false);

  const dom = useDom();

  const handleViewDomClick = React.useCallback(() => {
    onMenuClose();
    setViewDomDialogOpen(true);
  }, [onMenuClose]);

  const handleViewDomDialogClose = React.useCallback(() => setViewDomDialogOpen(false), []);

  return (
    <React.Fragment>
      <IconButton {...buttonProps} aria-label="Application menu">
        <MoreVertIcon />
      </IconButton>

      <Menu {...menuProps}>
        <MenuItem onClick={handleViewDomClick}>View DOM</MenuItem>
      </Menu>

      <Dialog
        open={viewDomDialogOpen}
        onClose={handleViewDomDialogClose}
        aria-labelledby={dialogTitleId}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id={dialogTitleId}>Application DOM</DialogTitle>
        <DialogContent sx={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
          <JsonView sx={{ flex: 1 }} copyToClipboard src={dom} expandPaths={[]} expandLevel={5} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDomDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export interface ComponentPanelProps {
  appId: string;
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ appId, className, sx }: ComponentPanelProps) {
  const { data: app, isLoading } = client.useQuery('getApp', [appId]);

  const [, setLatestStoredApp] = useLocalStorageState<LatestStoredAppValue>(
    TOOLPAD_LATEST_APP_KEY,
    null,
  );

  React.useEffect(() => {
    if (app) {
      setLatestStoredApp({
        appId,
        appName: app.name,
      });
    }
  }, [app, appId, setLatestStoredApp]);

  return (
    <PagePanelRoot className={className} sx={sx}>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <Skeleton variant="text" width={70} />
        ) : (
          <Tooltip title={app?.name || ''} enterDelay={500}>
            <Typography noWrap>{app?.name}</Typography>
          </Tooltip>
        )}
        <AppMenu />
      </Box>
      <Divider />
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
