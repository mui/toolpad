import * as React from 'react';
import {
  ApplicationVm,
  ArgTypeDefinition,
  BindableAttrValue,
  RuntimeScope,
  ScopeMeta,
} from '@mui/toolpad-core';
import { Alert, Box } from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import * as appDom from '../../../appDom';
import { useDomApi } from '../../AppState';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import { getDefaultControl } from '../../propertyControls';
import { NON_BINDABLE_CONTROL_TYPES } from '../../../runtime/constants';

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
}

export default function NodeAttributeEditor<P extends object>({
  node,
  namespace = 'attributes',
  name,
  argType,
  props,
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

  const Control = getDefaultControl(argType, props);

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isDisabled = !!argType.onChangeProp;

  const isBindable =
    !isDisabled &&
    namespace !== 'layout' &&
    !NON_BINDABLE_CONTROL_TYPES.includes(argType.control?.type as string);

  const jsBrowserRuntime = useBrowserJsRuntime();

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={bindingScope?.values ?? {}}
      globalScopeMeta={scopeMeta}
      label={argType.label || name}
      bindable={isBindable}
      disabled={isDisabled}
      propType={argType}
      jsRuntime={jsBrowserRuntime}
      renderControl={(params) => (
        <Box sx={{ flex: 1 }}>
          <Control nodeId={node.id} {...params} propType={argType} />
        </Box>
      )}
      value={propValue}
      onChange={handlePropChange}
    />
  ) : (
    <Alert severity="warning">
      {`No control for '${name}' (type '${argType.type}' ${
        argType.control ? `, control: '${argType.control.type}'` : ''
      })`}
    </Alert>
  );
}
