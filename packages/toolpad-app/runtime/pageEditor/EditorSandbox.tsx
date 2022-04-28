import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import ToolpadApp, {
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from './ToolpadApp';
import * as appDom from '../../src/appDom';
import { VersionOrPreview } from '../../src/types';
import { InstantiatedComponents } from '../../src/toolpadComponents';

export interface ToolpadBridge {
  updateDom(newDom: appDom.AppDom): void;
}

declare global {
  interface Window {
    __TOOLPAD_READY__?: boolean | (() => void);
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
    <runtime.NodeRuntimeWrapper nodeId={node.id} componentConfig={Component[TOOLPAD_COMPONENT]}>
      <Component {...wrappedProps} />
    </runtime.NodeRuntimeWrapper>
  );
}

export interface EditorCanvasProps {
  dom: appDom.AppDom;
  basename: string;
  appId: string;
  version: VersionOrPreview;
  components: InstantiatedComponents;
}

export default function EditorCanvas({ dom: initialDom, ...props }: EditorCanvasProps) {
  const [dom, setDom] = React.useState<appDom.AppDom>(initialDom);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      updateDom: (newDom) => setDom(newDom),
    };
    // eslint-disable-next-line no-underscore-dangle
    if (typeof window.__TOOLPAD_READY__ === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_READY__();
    } else {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_READY__ = true;
    }
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window.__TOOLPAD_BRIDGE__;
    };
  }, []);

  return (
    <RenderToolpadComponentProvider value={renderToolpadComponent}>
      <ToolpadApp dom={dom} {...props} />
    </RenderToolpadComponentProvider>
  );
}
