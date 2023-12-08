import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Snackbar,
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import { BindableAttrValue, EnvAttrValue } from '@mui/toolpad-core';
import { useAppState, useAppStateApi } from '../AppState';
import * as appDom from '../../appDom';
import { useProjectApi } from '../../projectApi';
import { BindingEditor } from './BindingEditor';
import { getBindingType } from '../../runtime/bindings';

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

  const projectApi = useProjectApi();
  const { data: env } = projectApi.useQuery('getEnvDeclaredValues', []);

  const jsServerRuntime = React.useMemo(() => createServerJsRuntime(env ?? {}), [env]);

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
          providerConfig: {},
        });

        return draft;
      });
    },
    [appState],
  );

  const handleAuthSecretChange = React.useCallback(
    (newValue: BindableAttrValue<string> | null) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          secret: (newValue as EnvAttrValue) || undefined,
        });

        return draft;
      });
    },
    [appState],
  );

  const handleAuthDomainChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: domain },
      } = event;

      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          providerConfig: {
            ...app.attributes?.authorization?.providerConfig,
            domain: domain || undefined,
          },
        });

        return draft;
      });
    },
    [appState],
  );

  const handleClientIDChange = React.useCallback(
    (newValue: BindableAttrValue<string> | null) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          providerConfig: {
            ...app.attributes?.authorization?.providerConfig,
            clientId: newValue || undefined,
          },
        });

        return draft;
      });
    },
    [appState],
  );

  const handleClientSecretChange = React.useCallback(
    (newValue: BindableAttrValue<string> | null) => {
      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
          ...app.attributes?.authorization,
          providerConfig: {
            ...app.attributes?.authorization?.providerConfig,
            clientSecret: newValue || undefined,
          },
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

  const getBindingDisplayValue = React.useCallback((value: BindableAttrValue<string> | null) => {
    const valueBindingType = value && getBindingType(value);

    if (valueBindingType && valueBindingType === 'env') {
      return (value as EnvAttrValue).$$env;
    }

    return value;
  }, []);

  const [clipboardSnackbarOpen, setClipboardSnackbarOpen] = React.useState(false);
  const handleAuthSecretClipboardClick = React.useCallback(() => {
    window.navigator.clipboard.writeText('openssl rand -base64 32');
    setClipboardSnackbarOpen(true);
  }, []);
  const handleClipboardSnackbarClose = React.useCallback(() => setClipboardSnackbarOpen(false), []);

  const authProviderConfig = authorization?.providerConfig ?? {};

  return (
    <React.Fragment>
      <Stack direction="row" gap={1}>
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
        <Stack direction="row" alignItems="start" flex={1}>
          <TextField
            disabled
            label="Authentication secret*"
            value={getBindingDisplayValue(
              (authorization?.secret as BindableAttrValue<string>) ?? '',
            )}
            fullWidth
            error={!!authorization?.provider && !authorization.secret}
            helperText={
              !authorization?.secret ? (
                <React.Fragment>
                  A random string used to hash tokens, sign/encrypt cookies and generate
                  cryptographic keys. You can create a good value on the command line with
                  <br />
                  <Tooltip title="Copy to clipboard">
                    <em>
                      <Typography noWrap component="code" fontSize={13}>
                        openssl rand -base64 32{' '}
                        <IconButton onClick={handleAuthSecretClipboardClick}>
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Typography>
                    </em>
                  </Tooltip>
                  <Snackbar
                    open={clipboardSnackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleClipboardSnackbarClose}
                    message="Copied to clipboard"
                  />
                </React.Fragment>
              ) : null
            }
            sx={{ ml: '6px' }}
          />
          <Box sx={{ mt: 1 }}>
            <BindingEditor
              globalScope={{}}
              globalScopeMeta={{}}
              value={(authorization?.secret as BindableAttrValue<string>) ?? ''}
              onChange={handleAuthSecretChange}
              jsRuntime={jsServerRuntime}
              label="Authentication secret"
              propType={{ type: 'string' }}
              env={env}
              hasEnvOnly
            />
          </Box>
        </Stack>
      </Stack>
      {authorization?.provider === 'google' ? (
        <TextField
          label="Restricted domain"
          value={getBindingDisplayValue(
            (authProviderConfig.domain as BindableAttrValue<string>) || '',
          )}
          onChange={handleAuthDomainChange}
          fullWidth
          placeholder="example.com"
          helperText="If set, only allow users with email addresses in this domain."
        />
      ) : null}
      {authorization?.provider ? (
        <React.Fragment>
          <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="start" flex={1}>
              <TextField
                disabled
                label="Client ID*"
                value={getBindingDisplayValue(
                  (authProviderConfig.clientId as BindableAttrValue<string>) ?? '',
                )}
                fullWidth
                error={!authProviderConfig.clientId}
              />
              <Box sx={{ mt: 1 }}>
                <BindingEditor
                  globalScope={{}}
                  globalScopeMeta={{}}
                  value={(authProviderConfig.clientId as BindableAttrValue<string>) ?? ''}
                  onChange={handleClientIDChange}
                  jsRuntime={jsServerRuntime}
                  label="Client ID"
                  propType={{ type: 'string' }}
                  env={env}
                  hasEnvOnly
                />
              </Box>
            </Stack>
            <Stack direction="row" alignItems="start" flex={1}>
              <TextField
                disabled
                label="Client secret*"
                value={getBindingDisplayValue(
                  (authProviderConfig.clientSecret as BindableAttrValue<string>) ?? '',
                )}
                fullWidth
                error={!authProviderConfig.clientSecret}
                sx={{ ml: '12px' }}
              />
              <Box sx={{ mt: 1 }}>
                <BindingEditor
                  globalScope={{}}
                  globalScopeMeta={{}}
                  value={(authProviderConfig.clientSecret as BindableAttrValue<string>) ?? ''}
                  onChange={handleClientSecretChange}
                  jsRuntime={jsServerRuntime}
                  label="Client secret"
                  propType={{ type: 'string' }}
                  env={env}
                  hasEnvOnly
                />
              </Box>
            </Stack>
          </Stack>
          {currentProviderData ? (
            <Link href="/" variant="caption">
              How to set up a {currentProviderData.name} OAuth provider?
            </Link>
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
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
