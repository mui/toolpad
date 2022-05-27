import * as React from 'react';
import { fireEvent } from '@mui/toolpad-core/runtime';
import ToolpadApp from './ToolpadApp';
import * as appDom from '../appDom';

export interface AppCanvasProps {
  appId: string;
  basename: string;
}

export default function AppCanvas({ appId, basename }: AppCanvasProps) {
  const [dom, setDom] = React.useState<appDom.AppDom | null>(null);

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

  React.useEffect(() => {
    // Run after every render
    fireEvent({ type: 'afterRender' });
  });

  return dom ? (
    <ToolpadApp dom={dom} version="preview" appId={appId} basename={basename} />
  ) : (
    <div>loading...</div>
  );
}
