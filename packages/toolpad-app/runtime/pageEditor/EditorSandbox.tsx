import * as React from 'react';
import ToolpadApp from './ToolpadApp';
import * as appDom from '../../src/appDom';
import { VersionOrPreview } from '../../src/types';
import { ToolpadComponentDefinitions } from '../../src/toolpadComponents';

export interface ToolpadBridge {
  updateDom(newDom: appDom.AppDom): void;
}

declare global {
  interface Window {
    __TOOLPAD_READY__?: boolean | (() => void);
    __TOOLPAD_BRIDGE__?: ToolpadBridge;
  }
}

export interface EditorCanvasProps {
  dom: appDom.AppDom;
  basename: string;
  appId: string;
  version: VersionOrPreview;
  components: ToolpadComponentDefinitions;
}

export default function EditorCanvas({ dom: initialDom, ...props }: EditorCanvasProps) {
  const [dom, setDom] = React.useState<appDom.AppDom>(initialDom);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      updateDom: (newDom) => {
        // @ts-expect-error Need to upgrade @types/react
        React.startTransition(() => {
          setDom(newDom);
        });
      },
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

  return <ToolpadApp dom={dom} {...props} />;
}
