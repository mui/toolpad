import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import ToolpadApp, {
  ComponentsContextProvider,
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from './ToolpadApp';
import * as appDom from '../../src/appDom';
import { useToolpadComponents } from '../../src/toolpadComponents';
import { VersionOrPreview } from '../../src/types';

export interface ToolpadBridge {
  updateDom(newDom: appDom.AppDom): void;
}

declare global {
  interface Window {
    __TOOLPAD_BRIDGE__?: ToolpadBridge;
  }
}

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
  dom: appDom.AppDom;
  basename: string;
  appId: string;
  version: VersionOrPreview;
}

export default function EditorCanvas({ dom: initialDom, ...props }: EditorCanvasProps) {
  const [dom, setDom] = React.useState<appDom.AppDom>(initialDom);

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

  const components = useToolpadComponents(dom);

  return (
    <ComponentsContextProvider value={components}>
      <RenderToolpadComponentProvider value={renderToolpadComponent}>
        <ToolpadApp dom={dom} {...props} />
      </RenderToolpadComponentProvider>
    </ComponentsContextProvider>
  );
}
