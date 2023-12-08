import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import { useAppState, useAppStateApi } from '../AppState';
import * as appDom from '../../appDom';

const AUTH_PROVIDERS = new Map([
  ['github', { name: 'GitHub', Icon: GitHubIcon }],
  ['google', { name: 'Google', Icon: GoogleIcon }],
]);

interface EditToolbarProps {
  addNewRoleDisabled: boolean;
  onAddNewRole: () => void;
}

function EditToolbar({ addNewRoleDisabled, onAddNewRole }: EditToolbarProps) {
  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={onAddNewRole}
        disabled={addNewRoleDisabled}
      >
        Add role
      </Button>
    </GridToolbarContainer>
  );
}

interface Role {
  name: string;
  description?: string;
}

interface RoleRow extends Role {
  id: string;
  pages: string[];
  isNew?: boolean;
}

export default function AppAuthorizationEditor() {
  const { dom } = useAppState();
  const appState = useAppStateApi();

  const [draftRow, setDraftRow] = React.useState<RoleRow | null>(null);

  const addRole = React.useCallback(
    (role: Role) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          roles: [...(app.attributes?.authorization?.roles ?? []), role],
        });

        return draft;
      });
    },
    [appState],
  );

  const updateRole = React.useCallback(
    (name: string, values: Omit<Role, 'name'>) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          roles: (app.attributes?.authorization?.roles ?? []).map((role) => {
            if (role.name === name) {
              return {
                ...role,
                ...values,
              };
            }
            return role;
          }),
        });

        return draft;
      });
    },
    [appState],
  );

  const deleteRole = React.useCallback(
    (name: string) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          roles: (app.attributes?.authorization?.roles ?? []).filter((role) => role.name !== name),
        });

        return draft;
      });
    },
    [appState],
  );

  const rolesRows = React.useMemo<RoleRow[]>(() => {
    const appNode = appDom.getApp(dom);
    const authorization = appNode.attributes.authorization;
    const roles = authorization?.roles;

    const { pages = [] } = appDom.getChildNodes(dom, appNode);

    const existingRows =
      roles?.map((role) => ({
        ...role,
        id: role.name,
        pages: pages
          .filter((page) => page.attributes.authorization?.allowedRoles?.includes(role.name))
          .map((page) => page.name),
      })) ?? [];

    return [...existingRows, ...(draftRow ? [draftRow] : [])];
  }, [dom, draftRow]);

  const rolesColumns = React.useMemo<GridColDef[]>(() => {
    return [
      {
        field: 'name',
        headerName: 'Name',
        editable: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        editable: true,
        flex: 1,
      },
      {
        field: 'pages',
        headerName: 'Pages',
        type: 'number',
        renderCell: ({ value }) => {
          const previewLength = 3;
          const preview = `${value.slice(0, previewLength).join(', ')}${
            value.length > previewLength ? '...' : ''
          }`;
          return (
            <Tooltip title={preview}>
              <span>{value.length}</span>
            </Tooltip>
          );
        },
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 50,
        cellClassName: 'actions',
        getActions: ({ row }) => {
          const isBlockedByPages = row.pages.length > 0;

          const deleteButton = (
            <GridActionsCellItem
              key="delete"
              disabled={isBlockedByPages || row.isNew}
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => deleteRole(row.name)}
              color="inherit"
            />
          );

          return [
            isBlockedByPages ? (
              <Tooltip
                key="delete"
                title="This role can't be deleted because it is still associated with existing pages."
              >
                <span>{deleteButton}</span>
              </Tooltip>
            ) : (
              deleteButton
            ),
          ];
        },
      },
    ];
  }, [deleteRole]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (
    newRow: GridRowModel<RoleRow>,
    oldRow: GridRowModel<RoleRow>,
  ): RoleRow => {
    setDraftRow(null);

    if (!newRow.name) {
      throw new Error(`Invalid row`);
    }

    const exists = rolesRows.some((row) => row.id !== newRow.id && row.name === newRow.name);

    if (exists) {
      throw new Error(`Role "${newRow.name}" already exists`);
    }

    if (oldRow.isNew) {
      addRole({
        name: newRow.name,
        description: newRow.description,
      });
    } else {
      updateRole(newRow.name, {
        description: newRow.description,
      });
    }

    return {
      ...newRow,
      id: newRow.name,
      pages: [],
      isNew: false,
    };
  };

  const handleAddNewRole = React.useCallback(() => {
    const draftRowId = `<draf_row>-${Math.random()}`;
    setDraftRow({ id: draftRowId, name: '', description: '', pages: [], isNew: true });
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [draftRowId]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      style={{ height: 350, width: '100%' }}
      onKeyDown={(event) => {
        if (Object.keys(rowModesModel).length > 0) {
          // Avoid the escape key from closing a dialog this grid is rendered in
          event.stopPropagation();
        }
      }}
    >
      <DataGrid
        rows={rolesRows}
        columns={rolesColumns}
        hideFooter
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        // onProcessRowUpdateError={(error) => console.log(error)}
        isCellEditable={(params) => {
          if (params.field === 'name') {
            return !!params.row.isNew;
          }
          return true;
        }}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: {
            onAddNewRole: handleAddNewRole,
            addNewRoleDisabled: !!draftRow,
          },
        }}
        autoHeight
      />
    </div>
  );
}

export function AppAuthenticationEditor() {
  const { dom } = useAppState();
  const appState = useAppStateApi();

  const handleAuthProviderChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: provider },
      } = event;

      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          provider: (provider as 'github' | 'google') || undefined,
        });

        return draft;
      });
    },
    [appState],
  );

  const appNode = appDom.getApp(dom);
  const authorization = appNode.attributes.authorization;

  const currentProviderData = React.useMemo(
    () => (authorization?.provider ? AUTH_PROVIDERS.get(authorization?.provider) : null),
    [authorization?.provider],
  );

  return (
    <Stack direction="column">
      <TextField
        select
        label="Authentication provider"
        value={authorization?.provider || ''}
        onChange={handleAuthProviderChange}
        helperText="If set, only authenticated users can view pages."
        defaultValue=""
        sx={{ flex: 1 }}
      >
        <MenuItem value="">
          <Typography ml={1}>No authentication</Typography>
        </MenuItem>
        {[...AUTH_PROVIDERS].map(([value, { name, Icon }]) => (
          <MenuItem key={value} value={value}>
            <Stack direction="row" alignItems="center">
              <Icon fontSize="small" />
              <Typography ml={1}>{name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </TextField>
      {currentProviderData ? (
        <Link href="/" target="_blank">
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1, fontSize: 14 }}>
            Learn how to set up {currentProviderData.name} as authentication provider.
          </Typography>
        </Link>
      ) : null}
    </Stack>
  );
}

export interface AppAuthorizationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AppAuthorizationDialog({ open, onClose }: AppAuthorizationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Authorization</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" mb={1}>
          Authentication
        </Typography>
        <AppAuthenticationEditor />
        <Typography variant="subtitle1" mt={1} mb={1}>
          Roles
        </Typography>
        <Typography variant="body2">
          Define the roles for your application. You can configure your pages to be accessible to
          specific roles only.
        </Typography>
        <AppAuthorizationEditor />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
