import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import { styled } from '@mui/material';
import { VersionOrPreview } from '../types';
import ToolpadApp, {
  ComponentsContextProvider,
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from './ToolpadApp';
import * as appDom from '../appDom';
import { useToolpadComponents } from '../toolpadComponents';

export interface ToolpadBridge {
  updateDom(newDom: appDom.AppDom): void;
}

declare global {
  interface Window {
    __TOOLPAD_BRIDGE__?: ToolpadBridge;
  }
}

const EditorRoot = styled('div')({
  overflow: 'hidden',
});

function renderToolpadComponent({
  Component,
  props,
  node,
  argTypes,
}: RenderToolpadComponentParams): React.ReactElement {
  const wrappedProps = { ...props };
  // eslint-disable-next-line no-restricted-syntax
  for (const [propName, argType] of Object.entries(argTypes)) {
    if (argType?.typeDef.type === 'element') {
      if (argType.control?.type === 'slots') {
        const value = wrappedProps[propName];
        wrappedProps[propName] = <runtime.Slots prop={propName}>{value}</runtime.Slots>;
      } else if (argType.control?.type === 'slot') {
        const value = wrappedProps[propName];
        wrappedProps[propName] = <runtime.Placeholder prop={propName}>{value}</runtime.Placeholder>;
      }
    }
  }
  return (
    <runtime.NodeRuntimeWrapper nodeId={node.id}>
      <Component {...wrappedProps} />
    </runtime.NodeRuntimeWrapper>
  );
}

export interface EditorCanvasProps {
  basename: string;
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
}

export default function EditorCanvas({ dom: domProp, ...props }: EditorCanvasProps) {
  const [dom, setDom] = React.useState(domProp);
  React.useEffect(() => setDom(domProp), [domProp]);

  const components = useToolpadComponents(dom);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      updateDom: (newDom) => setDom(newDom),
    };
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window.__TOOLPAD_BRIDGE__;
    };
  }, []);

  return (
    <ComponentsContextProvider value={components}>
      <RenderToolpadComponentProvider value={renderToolpadComponent}>
        <EditorRoot id="root">
          <ToolpadApp dom={dom} {...props} />
        </EditorRoot>
      </RenderToolpadComponentProvider>
    </ComponentsContextProvider>
  );
}
