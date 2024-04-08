import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Tab,
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
import { TabContext, TabList } from '@mui/lab';
import { updateArray } from '@toolpad/utils/immutability';
import * as appDom from '@toolpad/studio-runtime/appDom';
import invariant from 'invariant';
import { useAppState, useAppStateApi } from '../AppState';
import TabPanel from '../../components/TabPanel';
import AzureIcon from '../../components/icons/AzureIcon';
import { UpgradeAlert } from './UpgradeAlert';

interface AuthProviderOption {
  name: string;
  icon: React.ReactNode;
  hasRoles: boolean;
}

const AUTH_PROVIDER_OPTIONS = new Map<string, AuthProviderOption>([
  ['github', { name: 'GitHub', icon: <GitHubIcon fontSize="small" />, hasRoles: false }],
  ['google', { name: 'Google', icon: <GoogleIcon fontSize="small" />, hasRoles: false }],
  [
    'azure-ad',
    {
      name: 'Azure AD',
      icon: <AzureIcon />,
      hasRoles: true,
    },
  ],
]);

export function AppAuthenticationEditor() {
  const { dom } = useAppState();
  const appState = useAppStateApi();
  const plan = appDom.getPlan(dom);
  const isPaidPlan = plan !== undefined && plan !== 'free';

  const handleAuthProvidersChange = React.useCallback(
    (event: SelectChangeEvent<appDom.AuthProvider[]>) => {
      const {
        target: { value: providers },
      } = event;

      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authentication', {
          ...app.attributes?.authentication,
          providers: (typeof providers === 'string' ? providers.split(',') : providers).map(
            (provider) => ({ provider }) as appDom.AuthProviderConfig,
          ),
        });

        return draft;
      });
    },
    [appState],
  );

  const handleRestrictedDomainsChange = React.useCallback(
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: domain },
      } = event;

      appState.update((draft) => {
        const app = appDom.getApp(draft);

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authentication', {
          ...app.attributes?.authentication,
          restrictedDomains: updateArray(
            app.attributes?.authentication?.restrictedDomains ?? [],
            domain,
            index,
          ).filter((restrictedDomain) => restrictedDomain !== ''),
        });

        return draft;
      });
    },
    [appState],
  );

  const appNode = appDom.getApp(dom);
  const { authentication } = appNode.attributes;

  const authProviders = React.useMemo(
    () => authentication?.providers ?? [],
    [authentication?.providers],
  ).map((providerConfig) => providerConfig.provider);

  const restrictedDomains = authentication?.restrictedDomains ?? [];

  return (
    <Stack direction="column">
      <Typography variant="subtitle1" mb={1}>
        Providers
      </Typography>
      <FormControl>
        <InputLabel id="auth-providers-label">Authentication providers</InputLabel>
        <Select<appDom.AuthProvider[]>
          labelId="auth-providers-label"
          label="Authentication providers"
          id="auth-providers"
          multiple
          value={authProviders}
          onChange={handleAuthProvidersChange}
          fullWidth
          renderValue={(selected) =>
            selected
              .filter((selectedValue) => AUTH_PROVIDER_OPTIONS.has(selectedValue))
              .map((selectedValue) => AUTH_PROVIDER_OPTIONS.get(selectedValue)?.name ?? '')
              .join(', ')
          }
        >
          {[...AUTH_PROVIDER_OPTIONS].map(([value, { name, icon, hasRoles }]) => (
            <MenuItem key={value} value={value} disabled={hasRoles && !isPaidPlan}>
              <Stack direction="row" alignItems="center">
                <Checkbox checked={authProviders.indexOf(value as appDom.AuthProvider) > -1} />
                {icon}
                <Typography mx={1}>{name}</Typography>
                {hasRoles && !isPaidPlan ? <UpgradeAlert feature={name} hideAction /> : null}
              </Stack>
            </MenuItem>
          ))}
        </Select>
        <FormHelperText id="auth-providers-helper-text">
          If set, only authenticated users can use the app.
        </FormHelperText>
      </FormControl>
      <Alert severity="info" sx={{ mt: 1 }}>
        Certain environment variables must be set for authentication providers to work.{' '}
        <Link href="https://mui.com/toolpad/studio/concepts/authentication" target="_blank">
          Learn how to set up authentication
        </Link>
        .
      </Alert>

      <Typography variant="subtitle1" mt={2}>
        Required email domains
      </Typography>
      <Typography variant="body2" mt={1}>
        If set, authenticated user emails must be in one of the domains below.
      </Typography>
      {[...restrictedDomains, ''].map((domain, index) => (
        <TextField
          key={index}
          value={domain}
          onChange={handleRestrictedDomainsChange(index)}
          placeholder="example.com"
        />
      ))}
      {!isPaidPlan ? (
        <UpgradeAlert
          type="error"
          feature="Using authentication with a few specific providers (Azure AD)"
          sx={{ position: 'absolute', bottom: (theme) => theme.spacing(4) }}
        />
      ) : (
        <UpgradeAlert
          type="warning"
          warning="You are using features that are not covered by our MIT License. You will have to buy a license to use them in production."
          hideAction
          sx={{ position: 'absolute', bottom: (theme) => theme.spacing(4) }}
        />
      )}
    </Stack>
  );
}

interface RolesToolbarProps extends React.ComponentProps<typeof GridToolbarContainer> {
  addNewRoleDisabled?: boolean;
  onAddNewRole?: () => void;
}

function RolesToolbar({ addNewRoleDisabled, onAddNewRole }: RolesToolbarProps) {
  invariant(typeof addNewRoleDisabled === 'boolean', 'addNewRoleDisabled is required in slotProps');
  invariant(typeof onAddNewRole === 'function', 'onAddNewRole is required in slotProps');
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

export function AppRolesEditor({ onRowUpdateError }: { onRowUpdateError: (error: Error) => void }) {
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
        flex: 0.4,
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
    const draftRowId = `<draft_row>-${Math.random()}`;
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
        onProcessRowUpdateError={onRowUpdateError}
        isCellEditable={(params) => {
          if (params.field === 'name') {
            return !!params.row.isNew;
          }
          return true;
        }}
        slots={{
          toolbar: RolesToolbar,
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

interface RoleMapping {
  role: string;
  providerRoles: string;
}

interface RoleMappingRow extends RoleMapping {
  id: string;
}

export function AppRoleMappingsEditor({
  roleEnabledActiveAuthProviderOptions,
  onRowUpdateError,
}: {
  roleEnabledActiveAuthProviderOptions: [string, AuthProviderOption][];
  onRowUpdateError: (error: Error) => void;
}) {
  const { dom } = useAppState();
  const appState = useAppStateApi();

  const [activeAuthProvider, setAuthProvider] = React.useState<appDom.AuthProvider | null>(
    (roleEnabledActiveAuthProviderOptions[0]?.[0] as appDom.AuthProvider) ?? null,
  );

  const handleAuthProviderChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value: provider } = event.target;

      setAuthProvider(provider as appDom.AuthProvider);
    },
    [],
  );

  const updateRoleMapping = React.useCallback(
    (role: string, providerRoles: string) => {
      if (!activeAuthProvider) {
        return;
      }

      appState.update((draft) => {
        const app = appDom.getApp(draft);

        const activeAuthProviderConfig = app.attributes?.authentication?.providers?.find(
          (providerConfig) => providerConfig.provider === activeAuthProvider,
        );

        draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authentication', {
          ...app.attributes?.authentication,
          providers: [
            ...(app.attributes?.authentication?.providers ?? []).filter(
              (providerConfig) => providerConfig.provider !== activeAuthProvider,
            ),
            {
              ...activeAuthProviderConfig,
              provider: activeAuthProvider,
              roles: [
                ...(activeAuthProviderConfig?.roles ?? []).filter(
                  (roleMapping) => roleMapping.target !== role,
                ),
                {
                  source: (providerRoles || role)
                    .split(',')
                    .map((updatedRole) => updatedRole.trim()),
                  target: role,
                },
              ],
            },
          ],
        });

        return draft;
      });
    },
    [activeAuthProvider, appState],
  );

  const roleMappingsRows = React.useMemo<RoleMappingRow[]>(() => {
    if (!activeAuthProvider) {
      return [];
    }

    const appNode = appDom.getApp(dom);
    const authorization = appNode.attributes.authorization;
    const roles = authorization?.roles ?? [];

    const authentication = appNode.attributes.authentication;
    const roleMappings = activeAuthProvider
      ? authentication?.providers?.find(
          (providerConfig) => providerConfig.provider === activeAuthProvider,
        )?.roles ?? []
      : [];

    const existingRows =
      roles?.map((role) => {
        const targetRoleMapping = roleMappings.find(
          (roleMapping) => roleMapping.target === role.name,
        );

        return {
          id: role.name,
          role: role.name,
          providerRoles: targetRoleMapping ? targetRoleMapping.source.join(', ') : role.name,
        };
      }) ?? [];

    return existingRows;
  }, [activeAuthProvider, dom]);

  const roleMappingsColumns = React.useMemo<GridColDef[]>(() => {
    return [
      {
        field: 'role',
        headerName: 'Role',
        editable: false,
        flex: 0.4,
      },
      {
        field: 'providerRoles',
        headerName: 'Provider roles',
        editable: true,
        flex: 1,
      },
    ];
  }, []);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow: GridRowModel<RoleMappingRow>): RoleMappingRow => {
    updateRoleMapping(newRow.id, newRow.providerRoles);

    return { ...newRow, providerRoles: newRow.providerRoles || newRow.role };
  };

  return (
    <React.Fragment>
      <TextField
        label="Authentication provider"
        id="auth-provider"
        value={activeAuthProvider ?? undefined}
        onChange={handleAuthProviderChange}
        fullWidth
        select
        sx={{ mt: 2 }}
      >
        {roleEnabledActiveAuthProviderOptions.map(([value, { name }]) => (
          <MenuItem key={value} value={value}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
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
          rows={roleMappingsRows}
          columns={roleMappingsColumns}
          hideFooter
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onRowUpdateError}
          autoHeight
          localeText={{
            noRowsLabel: activeAuthProvider ? 'No roles defined' : 'No provider selected',
          }}
        />
      </div>
    </React.Fragment>
  );
}

export interface AppAuthorizationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AppAuthorizationDialog({ open, onClose }: AppAuthorizationDialogProps) {
  const { dom } = useAppState();
  const plan = appDom.getPlan(dom);
  const isPaidPlan = plan !== undefined && plan !== 'free';

  const [activeTab, setActiveTab] = React.useState<'authentication' | 'roles' | 'users'>(
    'authentication',
  );

  const handleActiveTabChange = React.useCallback((event: React.SyntheticEvent, newTab: string) => {
    setActiveTab(newTab as 'authentication' | 'roles' | 'users');
  }, []);

  const [errorSnackbarMessage, setErrorSnackbarMessage] = React.useState<string>('');

  const handleRowUpdateError = React.useCallback((error: Error) => {
    setErrorSnackbarMessage(error.message);
  }, []);

  const handleErrorSnackbarClose = React.useCallback(() => {
    setErrorSnackbarMessage('');
  }, []);

  const roleEnabledActiveAuthProviderOptions = React.useMemo(() => {
    const appNode = appDom.getApp(dom);

    const authProviders = (appNode.attributes.authentication?.providers ?? [])
      .filter((providerConfig) => AUTH_PROVIDER_OPTIONS.has(providerConfig.provider))
      .map((providerConfig) => providerConfig.provider);

    return [...AUTH_PROVIDER_OPTIONS].filter(
      ([optionKey, { hasRoles }]) =>
        hasRoles && authProviders.includes(optionKey as appDom.AuthProvider),
    );
  }, [dom]);

  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Authorization</DialogTitle>
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleActiveTabChange}
              aria-label="Authorization configuration options"
            >
              <Tab label="Authentication" value="authentication" sx={{ px: 2 }} />
              <Tab label="Roles" value="roles" sx={{ px: 2 }} />
              {roleEnabledActiveAuthProviderOptions.length > 0 ? (
                <Tab label="Role mappings" value="roleMappings" sx={{ px: 2 }} />
              ) : null}
            </TabList>
          </Box>
          <DialogContent sx={{ minHeight: 480 }}>
            <TabPanel disableGutters value="authentication">
              <AppAuthenticationEditor />
            </TabPanel>

            <React.Fragment>
              <TabPanel disableGutters value="roles">
                {isPaidPlan ? (
                  <React.Fragment>
                    <Typography variant="body2">
                      Define the roles for your application. You can configure your pages to be
                      accessible to specific roles only.
                    </Typography>
                    <AppRolesEditor onRowUpdateError={handleRowUpdateError} />
                  </React.Fragment>
                ) : (
                  <UpgradeAlert type="error" feature="Role based access control" />
                )}
              </TabPanel>
              <TabPanel disableGutters value="roleMappings">
                {isPaidPlan ? (
                  <React.Fragment>
                    <Typography variant="body2">
                      Define mappings from authentication provider roles to Toolpad Studio roles.
                    </Typography>
                    <AppRoleMappingsEditor
                      onRowUpdateError={handleRowUpdateError}
                      roleEnabledActiveAuthProviderOptions={roleEnabledActiveAuthProviderOptions}
                    />
                  </React.Fragment>
                ) : (
                  <UpgradeAlert feature="Role mapping" />
                )}
              </TabPanel>
            </React.Fragment>
          </DialogContent>
        </TabContext>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!errorSnackbarMessage}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
      >
        {errorSnackbarMessage ? (
          <Alert onClose={handleErrorSnackbarClose} severity="error">
            {errorSnackbarMessage}
          </Alert>
        ) : undefined}
      </Snackbar>
    </React.Fragment>
  );
}
