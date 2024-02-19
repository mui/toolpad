import * as React from 'react';
import {
  Box,
  Checkbox,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  styled,
  tooltipClasses,
  TooltipProps,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  TextField,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import AddLinkIcon from '@mui/icons-material/AddLink';
import {
  LiveBinding,
  JsExpressionAttrValue,
  JsExpressionAction,
  ScopeMeta,
  ScopeMetaField,
  JsRuntime,
  PropValueType,
  BindableAttrValue,
  NavigationAction,
  EnvAttrValue,
} from '@mui/toolpad-core';
import { createProvidedContext } from '@mui/toolpad-utils/react';
import { TabContext, TabList } from '@mui/lab';
import useDebounced from '@mui/toolpad-utils/hooks/useDebounced';
import { errorFrom } from '@mui/toolpad-utils/errors';
import useLatest from '@mui/toolpad-utils/hooks/useLatest';
import { WithControlledProp, Maybe } from '@mui/toolpad-utils/types';
import * as appDom from '@mui/toolpad-core/appDom';
import { JsExpressionEditor } from './PageEditor/JsExpressionEditor';
import JsonView from '../../components/JsonView';
import { useEvaluateLiveBinding } from './useEvaluateLiveBinding';
import GlobalScopeExplorer from './GlobalScopeExplorer';

import { tryFormatExpression } from '../../utils/prettier';
import useShortcut from '../../utils/useShortcut';
import useUnsavedChangesConfirm from '../hooks/useUnsavedChangesConfirm';

import TabPanel from '../../components/TabPanel';

import { useAppState } from '../AppState';
import { getBindingType, getBindingValue } from '../../runtime/bindings';

import { useProjectApi } from '../../projectApi';

// eslint-disable-next-line import/no-cycle
import BindableEditor from './PageEditor/BindableEditor';

interface BindingEditorContext {
  label: string;
  globalScope: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
  /**
   * Serverside binding, use the QuickJs runtime to evaluate bindings
   */
  jsRuntime: JsRuntime;
  disabled?: boolean;
  propType?: PropValueType;
  liveBinding?: LiveBinding;
  env?: Record<string, string>;
}

const [useBindingEditorContext, BindingEditorContextProvider] =
  createProvidedContext<BindingEditorContext>('BindingEditor');

const ErrorTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.dark,
  },
}));

interface JsExpressionBindingEditorProps extends WithControlledProp<JsExpressionAttrValue | null> {
  globalScope: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
}

function JsExpressionBindingEditor({
  globalScope,
  globalScopeMeta,
  value,
  onChange,
}: JsExpressionBindingEditorProps) {
  const handleChange = React.useCallback(
    (newValue: string) => onChange({ $$jsExpression: newValue }),
    [onChange],
  );

  return (
    <JsExpressionEditor
      globalScope={globalScope}
      globalScopeMeta={globalScopeMeta}
      value={value?.$$jsExpression || ''}
      onChange={handleChange}
      autoFocus
    />
  );
}

interface JsExpressionPreviewProps {
  jsRuntime: JsRuntime;
  input: BindableAttrValue<any> | null;
  globalScope: Record<string, unknown>;
}

function JsExpressionPreview({ jsRuntime, input, globalScope }: JsExpressionPreviewProps) {
  const previewValue: LiveBinding = useEvaluateLiveBinding({ jsRuntime, input, globalScope });

  const lastGoodPreview = useLatest(previewValue?.error ? undefined : previewValue);
  const previewErrorDebounced = useDebounced(previewValue?.error, 500);
  const previewError = previewValue?.error && previewErrorDebounced;

  return (
    <React.Fragment>
      <Toolbar disableGutters>
        <Typography color="error">{previewError?.message}</Typography>
      </Toolbar>
      <JsonView sx={{ flex: 1 }} src={lastGoodPreview?.value} />
    </React.Fragment>
  );
}

export interface EnvBindingEditorProps extends WithControlledProp<EnvAttrValue | null> {}

export function EnvBindingEditor({ value, onChange }: EnvBindingEditorProps) {
  const context = useBindingEditorContext();
  const envVarNames = Object.keys(context.env ?? {});
  const handleInputChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string | null) => {
      onChange({
        $$env: newValue || '',
      });
    },
    [onChange],
  );

  return (
    <Box sx={{ my: 1 }}>
      <Typography>Assign to an environment variable</Typography>
      <Autocomplete
        freeSolo
        options={envVarNames}
        value={value?.$$env || ''}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            sx={{ my: 3 }}
            label="Environment variable name"
            helperText={
              value?.$$env && !envVarNames.includes(value.$$env)
                ? 'Warning: This variable is not in your env file!'
                : ''
            }
          />
        )}
      />
    </Box>
  );
}

function getValueBindingTab(value: Maybe<BindableAttrValue<any>>) {
  if (value?.$$env) {
    return 'env';
  }

  return 'jsExpression';
}

export interface ValueBindingEditorProps
  extends WithControlledProp<JsExpressionAttrValue | EnvAttrValue | null> {
  error: unknown;
}

export function ValueBindingEditor({ value, onChange, error }: ValueBindingEditorProps) {
  const {
    label,
    globalScope,
    globalScopeMeta = {},
    jsRuntime,
    propType,
    env,
  } = useBindingEditorContext();

  const hasEnv = Boolean(env);

  const [activeTab, setActiveTab] = React.useState<BindableType>(getValueBindingTab(value));
  React.useEffect(() => {
    setActiveTab(getValueBindingTab(value));
  }, [value]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: BindableType) => {
    setActiveTab(newValue);
  };
  const jsExpressionBindingEditor = (
    <Stack direction="row" sx={{ height: 400, gap: 2, my: hasEnv ? 3 : 0 }}>
      <GlobalScopeExplorer sx={{ width: 250 }} value={globalScope} meta={globalScopeMeta} />

      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography sx={{ mb: 2 }}>
          Make the &quot;{label}&quot; property dynamic with a JavaScript expression. This property
          expects a type: <code>{propType?.type || 'any'}</code>.
        </Typography>
        <JsExpressionBindingEditor
          globalScope={globalScope}
          globalScopeMeta={globalScopeMeta}
          value={
            (value as JsExpressionAttrValue)?.$$jsExpression
              ? (value as JsExpressionAttrValue)
              : null
          }
          onChange={onChange}
        />
        {error ? (
          <Box
            sx={{
              marginTop: '20px',
            }}
          >
            <Typography sx={{ mb: 2, color: 'red' }}>
              Error while reading the prettier configuration:
              {errorFrom(error).message ??
                'The prettier config could not be loaded and therefore the code would not be formatted'}
            </Typography>
          </Box>
        ) : null}
        <JsExpressionPreview jsRuntime={jsRuntime} input={value} globalScope={globalScope} />
      </Box>
    </Stack>
  );

  const envBindingEditor = (
    <EnvBindingEditor
      value={(value as EnvAttrValue)?.$$env ? (value as EnvAttrValue) : null}
      onChange={onChange}
    />
  );

  if (!hasEnv) {
    return jsExpressionBindingEditor;
  }

  return (
    <TabContext value={activeTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleTabChange} aria-label="Choose action kind ">
          <Tab label="JS expression" value="jsExpression" />
          <Tab label="Environment variable" value="env" />
        </TabList>
      </Box>
      <TabPanel value="jsExpression" disableGutters>
        <Box sx={{ my: 1 }}>
          <Typography>Bind to a JavaScript expression.</Typography>
          {jsExpressionBindingEditor}
        </Box>
      </TabPanel>
      <TabPanel value="env" disableGutters>
        {envBindingEditor}
      </TabPanel>
    </TabContext>
  );
}

export interface JsExpressionActionEditorProps
  extends WithControlledProp<JsExpressionAction | null> {}

function JsExpressionActionEditor({ value, onChange }: JsExpressionActionEditorProps) {
  const { globalScope, globalScopeMeta } = useBindingEditorContext();
  const handleCodeChange = React.useCallback(
    (newValue: string) => onChange({ $$jsExpressionAction: newValue }),
    [onChange],
  );

  return (
    <Box sx={{ my: 1 }}>
      <Typography>Run code when this event fires</Typography>
      <Box
        sx={{
          my: 3,
          display: 'flex',
          flexDirection: 'row',
          maxHeight: 250,
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        <GlobalScopeExplorer sx={{ width: 250 }} value={globalScope} meta={globalScopeMeta} />

        <JsExpressionEditor
          sx={{ flex: 1 }}
          globalScope={globalScope}
          globalScopeMeta={globalScopeMeta}
          value={value?.$$jsExpressionAction || ''}
          onChange={handleCodeChange}
          functionBody
          topLevelAwait
        />
      </Box>
    </Box>
  );
}

export interface NavigationActionParameterEditorProps
  extends WithControlledProp<BindableAttrValue<string> | null> {
  label: string;
}

function NavigationActionParameterEditor({
  label,
  value,
  onChange,
}: NavigationActionParameterEditorProps) {
  const { jsRuntime, globalScope, globalScopeMeta } = useBindingEditorContext();

  const liveBinding = useEvaluateLiveBinding({
    jsRuntime,
    input: value,
    globalScope,
  });

  return (
    <BindableEditor<string>
      liveBinding={liveBinding}
      jsRuntime={jsRuntime}
      globalScope={globalScope}
      globalScopeMeta={globalScopeMeta}
      label={label}
      propType={{ type: 'string' }}
      value={value || null}
      onChange={onChange}
    />
  );
}

export interface NavigationActionEditorProps extends WithControlledProp<NavigationAction | null> {}

function NavigationActionEditor({ value, onChange }: NavigationActionEditorProps) {
  const { dom } = useAppState();
  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  const getDefaultActionParameters = React.useCallback((page: appDom.PageNode) => {
    const defaultPageParameters = page.attributes.parameters || [];

    return Object.fromEntries(defaultPageParameters);
  }, []);

  const handlePageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const pageName = event.target.value;
      const page = appDom.getPageByName(dom, pageName);

      const defaultActionParameters =
        page && appDom.isPage(page) ? getDefaultActionParameters(page) : {};

      onChange({
        $$navigationAction: {
          page: pageName,
          parameters: defaultActionParameters,
        },
      });
    },
    [dom, getDefaultActionParameters, onChange],
  );

  const actionPageAliasOrName = value?.$$navigationAction?.page || null;
  const actionParameters = React.useMemo(
    () => value?.$$navigationAction.parameters || {},
    [value?.$$navigationAction.parameters],
  );

  const actionPage =
    pages.find((availablePage) => availablePage.name === actionPageAliasOrName) ||
    pages.find((availablePage) =>
      availablePage.attributes.alias?.some((alias) => alias === actionPageAliasOrName),
    );

  const handleActionParameterChange = React.useCallback(
    (actionParameterName: string) => (newValue: BindableAttrValue<string> | null) => {
      if (actionPageAliasOrName) {
        onChange({
          $$navigationAction: {
            page: actionPageAliasOrName,
            parameters: {
              ...actionParameters,
              ...(newValue ? { [actionParameterName]: newValue } : {}),
            },
          },
        });
      }
    },
    [actionPageAliasOrName, actionParameters, onChange],
  );

  const hasPagesAvailable = pages.length > 0;

  const defaultActionParameters = actionPage ? getDefaultActionParameters(actionPage) : {};

  const actionParameterEntries = Object.entries(actionParameters || defaultActionParameters);

  return (
    <Box sx={{ my: 1 }}>
      <Typography>Navigate to a page on this event</Typography>
      <TextField
        fullWidth
        sx={{ my: 3 }}
        label="Select a page"
        select
        value={actionPageAliasOrName || ''}
        onChange={handlePageChange}
        disabled={!hasPagesAvailable}
        helperText={hasPagesAvailable ? null : 'No other pages available'}
      >
        {pages.map((page) => (
          <MenuItem key={page.name} value={page.name}>
            {page.name}
          </MenuItem>
        ))}
      </TextField>
      {actionParameterEntries.length > 0 ? (
        <React.Fragment>
          <Typography variant="overline">Page parameters:</Typography>
          {Object.entries(actionParameters || defaultActionParameters).map((actionParameter) => {
            const [actionParameterName, actionParameterValue] = actionParameter;

            return (
              <NavigationActionParameterEditor
                key={actionParameterName}
                label={actionParameterName}
                value={actionParameterValue as BindableAttrValue<string>}
                onChange={handleActionParameterChange(actionParameterName)}
              />
            );
          })}
        </React.Fragment>
      ) : null}
    </Box>
  );
}

type BindableType = BindableAttrValue<any>['type'];

function getActionTab(value: Maybe<BindableAttrValue<any>>) {
  if (value?.$$navigationAction) {
    return 'navigationAction';
  }

  return 'jsExpressionAction';
}

export interface ActionEditorProps extends WithControlledProp<BindableAttrValue<any> | null> {}

function ActionEditor({ value, onChange }: ActionEditorProps) {
  const [activeTab, setActiveTab] = React.useState<BindableType>(getActionTab(value));
  React.useEffect(() => setActiveTab(getActionTab(value)), [value]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: BindableType) => {
    setActiveTab(newValue);
  };

  return (
    <TabContext value={activeTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleTabChange} aria-label="Choose action kind ">
          <Tab label="JS expression" value="jsExpressionAction" />
          <Tab label="Navigation" value="navigationAction" />
        </TabList>
      </Box>
      <TabPanel value="jsExpressionAction" disableGutters>
        <JsExpressionActionEditor
          value={value?.$$jsExpressionAction ? value : null}
          onChange={onChange}
        />
      </TabPanel>
      <TabPanel value="navigationAction" disableGutters>
        <NavigationActionEditor
          value={value?.$$navigationAction ? value : null}
          onChange={onChange}
        />
      </TabPanel>
    </TabContext>
  );
}

export interface BindingEditorDialogProps<V>
  extends WithControlledProp<BindableAttrValue<V> | null> {
  open: boolean;
  onClose: () => void;
}

export function BindingEditorDialog<V>({
  value,
  onChange,
  open,
  onClose,
}: BindingEditorDialogProps<V>) {
  const projectApi = useProjectApi();
  const { error, data } = projectApi.useQuery('getPrettierConfig', []);
  const { propType, label } = useBindingEditorContext();

  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    setInput(value);
  }, [open, value]);

  const committedInput = React.useRef<BindableAttrValue<V> | null>(input);

  const handleSave = React.useCallback(async () => {
    let newValue = input;

    if ((input as JsExpressionAttrValue)?.$$jsExpression) {
      const jsExpression = await tryFormatExpression(
        (input as JsExpressionAttrValue).$$jsExpression,
        data!,
      );
      // Remove trailing spaces, newline characters for cleanliness and
      // trailing semicolons since they introduce crashes while evaluation
      const cleanedExpression = jsExpression.trim().replace(/;*$/, '');
      newValue = {
        $$jsExpression: cleanedExpression,
      };
    }

    committedInput.current = newValue;
    onChange(newValue);
  }, [onChange, input, data]);

  const hasUnsavedChanges = input
    ? getBindingType(input) !==
        (committedInput.current && getBindingType(committedInput.current)) ||
      getBindingValue(input) !== (committedInput.current && getBindingValue(committedInput.current))
    : false;

  const { handleCloseWithUnsavedChanges } = useUnsavedChangesConfirm({
    hasUnsavedChanges,
    onClose,
  });

  const handleCommit = React.useCallback(() => {
    handleSave();
    onClose();
  }, [onClose, handleSave]);

  const handleRemove = React.useCallback(() => {
    committedInput.current = null;
    onChange(null);

    onClose();
  }, [onClose, onChange]);

  useShortcut({ key: 's', metaKey: true, disabled: !open }, handleSave);

  return (
    <Dialog
      onClose={handleCloseWithUnsavedChanges}
      open={open}
      fullWidth
      scroll="body"
      maxWidth="lg"
    >
      <DialogTitle>Bind property &quot;{label}&quot;</DialogTitle>
      <DialogContent
        sx={{
          height: '100vh',
          maxHeight: 560,
        }}
      >
        {propType?.type === 'event' ? (
          <ActionEditor value={input} onChange={(newValue) => setInput(newValue)} />
        ) : (
          <ValueBindingEditor
            error={error}
            value={
              (input as JsExpressionAttrValue)?.$$jsExpression || (input as EnvAttrValue)?.$$env
                ? (input as JsExpressionAttrValue | EnvAttrValue)
                : null
            }
            onChange={(newValue) => setInput(newValue)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          {hasUnsavedChanges ? 'Cancel' : 'Close'}
        </Button>
        <Button color="inherit" disabled={!value} onClick={handleRemove}>
          Remove binding
        </Button>
        <Button disabled={!hasUnsavedChanges} color="primary" onClick={handleCommit}>
          Update binding
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface BindingEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  label: string;
  globalScope: Record<string, unknown>;
  globalScopeMeta?: ScopeMeta;
  /**
   * Uses the QuickJs runtime to evaluate bindings, just like on the server
   */
  jsRuntime: JsRuntime;
  disabled?: boolean;
  hidden?: boolean;
  propType?: PropValueType;
  liveBinding?: LiveBinding;
  env?: Record<string, string>;
}

export function BindingEditor<V>({
  label,
  globalScope,
  globalScopeMeta,
  jsRuntime,
  disabled,
  hidden = false,
  propType,
  value,
  onChange,
  liveBinding,
  env,
}: BindingEditorProps<V>) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const hasBinding: boolean = !!value && getBindingType(value) !== 'const';

  const error: string | undefined = liveBinding?.error?.message;

  const bindingButton = (
    <Checkbox
      aria-label={`Bind property "${label}"`}
      checked={hasBinding}
      disabled={disabled}
      icon={<AddLinkIcon fontSize="inherit" />}
      checkedIcon={<LinkIcon fontSize="inherit" />}
      onClick={handleOpen}
      color={error ? 'error' : undefined}
      sx={{ visibility: hidden ? 'hidden' : 'visible' }}
    />
  );

  const TooltipComponent = error ? ErrorTooltip : Tooltip;
  const tooltipTitle: string =
    error ?? (hasBinding ? `Update "${label}" binding…` : `Bind "${label}"…`);
  const bindingButtonWithTooltip = disabled ? (
    bindingButton
  ) : (
    <TooltipComponent disableInteractive placement="top" title={tooltipTitle}>
      {bindingButton}
    </TooltipComponent>
  );

  const resolvedMeta = React.useMemo(() => {
    const meta: ScopeMeta = { ...globalScopeMeta };
    if (propType?.type === 'event' && propType.arguments) {
      for (const { name, tsType } of propType.arguments) {
        const metaField: ScopeMetaField = meta[name] ?? {};
        metaField.kind = 'local';
        metaField.tsType = tsType;
        meta[name] = metaField;
      }
    }

    return meta;
  }, [propType, globalScopeMeta]);

  const bindingEditorContext: BindingEditorContext = React.useMemo(
    () => ({
      label,
      globalScope,
      globalScopeMeta: resolvedMeta,
      jsRuntime,
      disabled,
      propType,
      liveBinding,
      env,
    }),
    [disabled, env, globalScope, jsRuntime, label, liveBinding, propType, resolvedMeta],
  );

  return (
    <BindingEditorContextProvider value={bindingEditorContext}>
      {bindingButtonWithTooltip}
      <BindingEditorDialog open={open} onClose={handleClose} value={value} onChange={onChange} />
    </BindingEditorContextProvider>
  );
}
