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
  Snackbar,
} from '@mui/material';
import * as React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HierarchyExplorer from './HierarchyExplorer';
import client from '../../api';
import { useDom } from '../DomLoader';
import JsonView from '../../components/JsonView';

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

function AppMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleAppMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleAppMenuClose = () => {
    setAnchorEl(null);
  };
  const buttonId = React.useId();
  const menuId = React.useId();
  const dialogTitleId = React.useId();

  const [viewDomDialogOpen, setViewDomDialogOpen] = React.useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = React.useState(false);

  const dom = useDom();

  const handleViewDomClick = React.useCallback(() => {
    handleAppMenuClose();
    setViewDomDialogOpen(true);
  }, []);

  const handleViewDomDialogClose = React.useCallback(() => setViewDomDialogOpen(false), []);

  const handleCopyToClipboard = React.useCallback(() => {
    window.navigator.clipboard.writeText(JSON.stringify(dom, null, 2));
    setCopySnackbarOpen(true);
  }, [dom]);

  const handleCopySnackbarClose = React.useCallback(() => setCopySnackbarOpen(false), []);

  return (
    <React.Fragment>
      <IconButton
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleAppMenuClick}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleAppMenuClose}
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
      >
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
        <DialogContent sx={{ position: 'relative', display: 'flex' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <JsonView src={dom} expandPaths={[]} expandLevel={5} />
          </Box>
          <Tooltip title="Copy the source">
            <IconButton
              onClick={handleCopyToClipboard}
              sx={{ position: 'absolute', top: 8, right: 36 }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDomDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCopySnackbarClose}
        message="DOM Copied to clipboard"
      />
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
