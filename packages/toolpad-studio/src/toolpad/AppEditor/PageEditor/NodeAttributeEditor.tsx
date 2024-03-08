import * as React from 'react';
import {
  ApplicationVm,
  ArgTypeDefinition,
  BindableAttrValue,
  RuntimeScope,
  ScopeMeta,
} from '@toolpad/studio-runtime';
import { Alert, Box, SxProps } from '@mui/material';
import { useBrowserJsRuntime } from '@toolpad/studio-runtime/jsBrowserRuntime';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useDomApi } from '../../AppState';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import { getDefaultControl, usePropControlsContext } from '../../propertyControls';

function buildScopeMeta(vm: ApplicationVm, bindingScope?: RuntimeScope): ScopeMeta {
  if (bindingScope?.parentScope) {
    return {
      ...buildScopeMeta(vm, bindingScope?.parentScope),
      ...bindingScope?.meta,
    };
  }
  return bindingScope?.meta ?? {};
}

export interface NodeAttributeEditorProps<P extends object, K extends keyof P = keyof P> {
  node: appDom.AppDomNode;
  namespace?: string;
  name: string;
  argType: ArgTypeDefinition<P, K>;
  props?: P;
  sx?: SxProps;
}

export default function NodeAttributeEditor<P extends object>({
  node,
  namespace = 'attributes',
  name,
  argType,
  props,
  sx,
}: NodeAttributeEditorProps<P>) {
  const domApi = useDomApi();

  const handlePropChange = React.useCallback(
    (newValue: BindableAttrValue<unknown> | null) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, node, namespace as any, name, newValue),
      );
    },
    [node, namespace, name, domApi],
  );

  const propValue: BindableAttrValue<unknown> | null = (node as any)[namespace]?.[name] ?? null;

  const bindingId = `${node.id}${namespace ? `.${namespace}` : ''}.${name}`;
  const { vm } = usePageEditorState();

  const scopeId = vm.bindingScopes[bindingId];
  const bindingScope = scopeId ? vm.scopes[scopeId] : undefined;

  const liveBinding = bindingScope?.bindings[bindingId];

  const scopeMeta = React.useMemo(() => buildScopeMeta(vm, bindingScope), [vm, bindingScope]);

  const propTypeControls = usePropControlsContext();
  const Control = getDefaultControl(propTypeControls, argType, props);

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isDisabled = !!argType.onChangeProp;

  const isBindable = !isDisabled && namespace !== 'layout' && argType.control?.bindable !== false;

  const jsBrowserRuntime = useBrowserJsRuntime();

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={bindingScope?.values ?? {}}
      globalScopeMeta={scopeMeta}
      label={argType.control?.hideLabel ? '' : argType.label || name}
      bindable={isBindable}
      disabled={isDisabled}
      propType={argType}
      jsRuntime={jsBrowserRuntime}
      renderControl={(params) => (
        <Box sx={{ flex: 1, maxWidth: '100%' }}>
          <Control nodeId={node.id} {...params} propType={argType} />
        </Box>
      )}
      value={propValue}
      onChange={handlePropChange}
      sx={sx}
    />
  ) : (
    <Alert severity="warning">
      {`No control for '${name}' (type '${argType.type}' ${
        argType.control ? `, control: '${argType.control.type}'` : ''
      })`}
    </Alert>
  );
}
