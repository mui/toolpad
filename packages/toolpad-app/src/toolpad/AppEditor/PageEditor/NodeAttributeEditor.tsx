import * as React from 'react';
import {
  ArgTypeDefinition,
  BindableAttrValue,
  DEFAULT_LOCAL_SCOPE_PARAMS,
  ScopeMeta,
} from '@mui/toolpad-core';
import { Alert, Box } from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { mapValues } from '../../../utils/collections';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import { getDefaultControl } from '../../propertyControls';
import MarkdownTooltip from '../../../components/MarkdownTooltip';
import { isTemplateDescendant } from '../../../toolpadComponents/template';

export interface NodeAttributeEditorProps<P extends object> {
  node: appDom.AppDomNode;
  namespace?: string;
  name: string;
  argType: ArgTypeDefinition<P>;
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

  const propType = argType.typeDef;
  const Control = getDefaultControl(argType, props);

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isDisabled = !!argType.onChangeHandler;

  const isBindable = !isDisabled && namespace !== 'layout';

  const jsBrowserRuntime = useBrowserJsRuntime();

  const isNodeTemplateDescendant = React.useMemo(
    () => appDom.isElement(node) && isTemplateDescendant(dom, node, viewState),
    [dom, node, viewState],
  );

  const localScopeMeta: ScopeMeta = React.useMemo(
    () =>
      mapValues(
        {
          ...(isNodeTemplateDescendant ? { i: DEFAULT_LOCAL_SCOPE_PARAMS.i } : {}),
        },
        () => ({ kind: 'local' }),
      ) as ScopeMeta,
    [isNodeTemplateDescendant],
  );

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={{ ...pageState, ...DEFAULT_LOCAL_SCOPE_PARAMS }}
      globalScopeMeta={{
        ...globalScopeMeta,
        ...localScopeMeta,
      }}
      label={argType.label || name}
      bindable={isBindable}
      disabled={isDisabled}
      propType={propType}
      jsRuntime={jsBrowserRuntime}
      renderControl={(params) => (
        <MarkdownTooltip placement="left" title={argType.helperText ?? ''}>
          <Box sx={{ flex: 1 }}>
            <Control nodeId={node.id} {...params} propType={propType} />
          </Box>
        </MarkdownTooltip>
      )}
      value={propValue}
      onChange={handlePropChange}
    />
  ) : (
    <Alert severity="warning">
      {`No control for '${name}' (type '${propType.type}' ${
        argType.control ? `, control: '${argType.control.type}'` : ''
      })`}
    </Alert>
  );
}
