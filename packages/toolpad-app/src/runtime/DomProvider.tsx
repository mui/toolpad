import * as React from 'react';
import * as appDom from '../appDom';
import { createProvidedContext } from '../utils/react';

const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');

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
  children?: React.ReactNode;
}

export default function DomProvider({ dom: domProp, children }: EditorCanvasProps) {
  const [dom, setDom] = React.useState<appDom.AppDom>(domProp);
  React.useEffect(() => setDom(domProp), [domProp]);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      updateDom: (newDom) => {
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

  return <DomContextProvider value={dom}>{children}</DomContextProvider>;
}

export { useDomContext };
