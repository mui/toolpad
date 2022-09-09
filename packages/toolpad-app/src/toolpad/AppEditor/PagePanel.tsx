import {
  styled,
  SxProps,
  // Typography,
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
import type { AppMeta } from '../../server/data';
import JsonView from '../../components/JsonView';
import EditableText from '../../components/EditableText';
import useMenu from '../../utils/useMenu';
import { parseError } from '../../utils/errors';

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

interface AppNameEditableProps {
  app?: AppMeta;
  editing?: boolean;
  setEditing: (editing: boolean) => void;
  loading?: boolean;
}

function AppNameEditable({ app, editing, setEditing, loading }: AppNameEditableProps) {
  const [appRenameError, setAppRenameError] = React.useState<Error | null>(null);
  const appNameInput = React.useRef<HTMLInputElement | null>(null);
  const [appName, setAppName] = React.useState<string>(app?.name || '');

  const handleAppNameChange = React.useCallback(
    (newValue: string) => {
      setAppRenameError(null);
      setAppName(newValue);
    },
    [setAppName],
  );

  const handleAppRenameClose = React.useCallback(() => {
    setEditing(false);
    setAppRenameError(null);
  }, [setEditing]);

  const handleAppRenameSave = React.useCallback(
    async (name: string) => {
      if (app?.id) {
        try {
          await client.mutation.updateApp(app.id, name);
          await client.invalidateQueries('getApps');
        } catch (rawError) {
          setAppRenameError(parseError(rawError));
          setEditing(true);
        }
      }
    },
    [app?.id, setEditing],
  );

  return loading ? (
    <Skeleton />
  ) : (
    <EditableText
      defaultValue={app?.name}
      editable={editing}
      helperText={appRenameError ? `An app named "${appName}" already exists` : null}
      error={!!appRenameError}
      onChange={handleAppNameChange}
      onClose={handleAppRenameClose}
      onSave={handleAppRenameSave}
      onClick={() => setEditing(true)}
      ref={appNameInput}
      sx={{
        width: '100%',
        '& :hover': {
          outline: `1px solid rgba(0,0,0,0.1)`,
        },
      }}
      inputSx={{
        cursor: 'text',
      }}
      value={appName}
      variant="subtitle1"
    />
  );
}

export interface ComponentPanelProps {
  appId: string;
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ appId, className, sx }: ComponentPanelProps) {
  const { data: app, isLoading } = client.useQuery('getApp', [appId]);
  const [editingAppTitle, setEditingAppTitle] = React.useState(false);

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
        {isLoading || !app ? (
          <Skeleton variant="text" width={70} />
        ) : (
          <Tooltip title={editingAppTitle ? '' : 'Rename'} arrow>
            <div>
              <AppNameEditable
                app={app}
                editing={editingAppTitle}
                setEditing={setEditingAppTitle}
                loading={isLoading}
              />
            </div>
          </Tooltip>
        )}
        <AppMenu />
      </Box>
      <Divider />
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
