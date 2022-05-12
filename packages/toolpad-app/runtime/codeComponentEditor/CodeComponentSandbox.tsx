import { styled } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as appDom from '../../src/appDom';
import useLatest from '../../src/utils/useLatest';
import AppThemeProvider from '../pageEditor/AppThemeProvider';
import createCodeComponent from './createCodeComponent';

interface SandboxUpdate {
  src: string;
  theme?: appDom.ThemeNode;
}

export interface CodeComponentSandboxBridge {
  updateSandbox: (updates: SandboxUpdate) => void;
}

declare global {
  interface Window {
    __CODE_COMPONENT_SANDBOX_READY__?: boolean | (() => void);
    __CODE_COMPONENT_SANDBOX_BRIDGE__?: CodeComponentSandboxBridge;
  }
}

const CodeComponentSandboxRoot = styled('div')({});

type UseCodeComponent =
  | {
      Component?: undefined;
      error?: undefined;
    }
  | {
      Component: React.ComponentType;
      error?: undefined;
    }
  | {
      Component?: undefined;
      error: Error;
    };

function useCodeComponent(src: string | null): UseCodeComponent {
  const [state, setState] = React.useState<UseCodeComponent>({});

  React.useEffect(() => {
    if (!src) {
      return;
    }

    const startSrc = src;
    createCodeComponent(startSrc)
      .then((Component) => {
        if (startSrc === src) {
          setState({ Component });
        }
      })
      .catch((error: Error) => {
        if (startSrc === src) {
          setState({ error });
        }
      });
  }, [src]);

  return state;
}

function Noop() {
  return null;
}

export default function CodeComponentSandbox() {
  const [codeComponentSrc, setCodeComponentSrc] = React.useState<string | null>(null);
  const [themeNode, setThemeNode] = React.useState<appDom.ThemeNode | undefined>();

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__CODE_COMPONENT_SANDBOX_BRIDGE__ = {
      updateSandbox: (updates) => {
        console.log(updates);
        setCodeComponentSrc(updates.src);
        setThemeNode(updates.theme);
      },
    };
    // eslint-disable-next-line no-underscore-dangle
    if (typeof window.__CODE_COMPONENT_SANDBOX_READY__ === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      window.__CODE_COMPONENT_SANDBOX_READY__();
    } else {
      // eslint-disable-next-line no-underscore-dangle
      window.__CODE_COMPONENT_SANDBOX_READY__ = true;
    }
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window.__CODE_COMPONENT_SANDBOX_BRIDGE__;
    };
  }, []);

  const deferredSrc: string | null = React.useDeferredValue(codeComponentSrc);

  const { Component: GeneratedComponent, error: compileError } = useCodeComponent(deferredSrc);

  const CodeComponent: React.ComponentType<any> = useLatest(GeneratedComponent) || Noop;

  console.log(themeNode);

  return (
    <React.Suspense fallback={null}>
      <ErrorBoundary
        resetKeys={[deferredSrc]}
        fallbackRender={({ error: runtimeError }) => (
          <React.Fragment>{runtimeError.message}</React.Fragment>
        )}
      >
        <CodeComponentSandboxRoot>
          <AppThemeProvider node={themeNode}>
            <CodeComponent />
          </AppThemeProvider>
        </CodeComponentSandboxRoot>
      </ErrorBoundary>
      {compileError?.message}
    </React.Suspense>
  );
}
