import * as React from 'react';
import {
  ArgTypeDefinition,
  BindableAttrValue,
  DEFAULT_LOCAL_SCOPE_PARAMS,
  LocalScopeParams,
  ScopeMeta,
  ScopeMetaField,
} from '@mui/toolpad-core';
import { Alert, Box } from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../AppState';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import { getDefaultControl } from '../../propertyControls';
import { isTemplateDescendant } from '../../../toolpadComponents/template';
import { NON_BINDABLE_CONTROL_TYPES } from '../../../runtime/constants';

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
  const { dom } = useDom();
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
  const { bindings, pageState, globalScopeMeta, viewState } = usePageEditorState();

  const liveBinding = bindings[bindingId];

  const Control = getDefaultControl(argType, props);

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isDisabled = !!argType.onChangeProp;

  const isBindable =
    !isDisabled &&
    namespace !== 'layout' &&
    !NON_BINDABLE_CONTROL_TYPES.includes(argType.control?.type as string);

  const jsBrowserRuntime = useBrowserJsRuntime();

  const isNodeTemplateDescendant = React.useMemo(
    () => appDom.isElement(node) && isTemplateDescendant(dom, node, viewState),
    [dom, node, viewState],
  );

  const localState: LocalScopeParams = isNodeTemplateDescendant
    ? { i: DEFAULT_LOCAL_SCOPE_PARAMS.i }
    : {};
  const localScopeMeta: ScopeMeta = mapValues(
    localState,
    () => ({ kind: 'local' } as ScopeMetaField),
  );

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={{ ...pageState, ...localState }}
      globalScopeMeta={{
        ...globalScopeMeta,
        ...localScopeMeta,
      }}
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
