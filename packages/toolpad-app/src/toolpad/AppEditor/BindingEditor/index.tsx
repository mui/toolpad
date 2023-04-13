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
} from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import AddLinkIcon from '@mui/icons-material/AddLink';
import {
  LiveBinding,
  JsExpressionAttrValue,
  JsExpressionAction,
  ScopeMeta,
  ScopeMetaField,
  JsRuntime,
  BindableAttrValue,
  PropValueType,
} from '@mui/toolpad-core';
import { createProvidedContext } from '@mui/toolpad-core/utils/react';
import { JsExpressionEditor } from '../PageEditor/JsExpressionEditor';
import JsonView from '../../../components/JsonView';
import useLatest from '../../../utils/useLatest';
import useDebounced from '../../../utils/useDebounced';
import { useEvaluateLiveBinding } from '../useEvaluateLiveBinding';
import GlobalScopeExplorer from '../GlobalScopeExplorer';
import { WithControlledProp } from '../../../utils/types';
import type { BindingEditorDialogProps } from './BindingEditorDialog';
import type { PropBindingEditorDialogProps } from './PropBindingEditorDialog';

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
}

export const [useBindingEditorContext, BindingEditorContextProvider] =
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
    (newValue: string) => onChange({ type: 'jsExpression', value: newValue }),
    [onChange],
  );

  return (
    <JsExpressionEditor
      globalScope={globalScope}
      globalScopeMeta={globalScopeMeta}
      value={value?.type === 'jsExpression' ? value.value : ''}
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

export interface JsBindingEditorProps extends WithControlledProp<JsExpressionAttrValue | null> {}

export function JsBindingEditor({ value, onChange }: JsBindingEditorProps) {
  const {
    label,
    globalScope,
    globalScopeMeta = {},
    jsRuntime,
    propType,
  } = useBindingEditorContext();

  return (
    <Stack direction="row" sx={{ height: 400, gap: 2 }}>
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
          value={value}
          onChange={onChange}
        />

        <JsExpressionPreview jsRuntime={jsRuntime} input={value} globalScope={globalScope} />
      </Box>
    </Stack>
  );
}

export interface JsExpressionActionEditorProps
  extends WithControlledProp<JsExpressionAction | null> {}

export function JsExpressionActionEditor({ value, onChange }: JsExpressionActionEditorProps) {
  const { globalScope, globalScopeMeta } = useBindingEditorContext();
  const handleCodeChange = React.useCallback(
    (newValue: string) => onChange({ type: 'jsExpressionAction', value: newValue }),
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
          value={value?.value || ''}
          onChange={handleCodeChange}
          functionBody
          topLevelAwait
        />
      </Box>
    </Box>
  );
}

export type BindableType = BindableAttrValue<any>['type'];

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
  Dialog:
    | React.ComponentType<BindingEditorDialogProps<V>>
    | React.ComponentType<PropBindingEditorDialogProps<V>>;
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
  Dialog,
}: BindingEditorProps<V>) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const hasBinding: boolean = !!value && value.type !== 'const';

  const error: string | undefined = liveBinding?.error?.message;

  const bindingButton = (
    <Checkbox
      aria-label={`Bind property "${label}"`}
      checked={hasBinding}
      disabled={disabled}
      icon={<AddLinkIcon />}
      checkedIcon={<LinkIcon />}
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
    }),
    [disabled, globalScope, jsRuntime, label, liveBinding, propType, resolvedMeta],
  );

  return (
    <BindingEditorContextProvider value={bindingEditorContext}>
      {bindingButtonWithTooltip}
      <Dialog open={open} onClose={handleClose} value={value} onChange={onChange} />
    </BindingEditorContextProvider>
  );
}
