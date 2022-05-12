import { styled } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AppThemeProvider from '../pageEditor/AppThemeProvider';
import createCodeComponent from './createCodeComponent';

export interface CodeComponentSandboxBridge {
  updateCodeComponent: (newNode: string) => void;
}

declare global {
  interface Window {
    __CODE_COMPONENT_SANDBOX_READY__?: boolean | (() => void);
    __CODE_COMPONENT_SANDBOX_BRIDGE__?: CodeComponentSandboxBridge;
  }
}

const CodeComponentSandboxRoot = styled('div')({});

interface CodeComponentProps<P> {
  src: string;
  props: P;
}

function useCodeComponent(src: string) {
  const [Component, setComponent] = React.useState<React.ComponentType>();
  const [error, setError] = React.useState<Error>();

  React.useEffect(() => {
    const startSrc = src;
    createCodeComponent(startSrc)
      .then((CreatedComponent) => {
        if (startSrc === src) {
          setComponent(() => CreatedComponent);
        }
      })
      .catch((creationError: Error) => setError(creationError));
  }, [src]);

  return {
    Component,
    error,
  };
}

function CodeComponent<P>({ src, props }: CodeComponentProps<P>) {
  const { Component = () => null, error } = useCodeComponent(src);
  if (error) {
    throw error;
  }
  return <Component {...props} />;
}

export default function CodeComponentSandbox() {
  const [codeComponentSrc, setCodeComponentSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__CODE_COMPONENT_SANDBOX_BRIDGE__ = {
      updateCodeComponent: (component) => {
        setCodeComponentSrc(component);
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

  // @ts-expect-error
  const deferredSrc: string | null = React.useDeferredValue(codeComponentSrc);

  return (
    <React.Suspense fallback={null}>
      <ErrorBoundary
        resetKeys={[deferredSrc]}
        fallbackRender={({ error }) => <React.Fragment>{error.message}</React.Fragment>}
      >
        <CodeComponentSandboxRoot>
          <AppThemeProvider node={null}>
            {deferredSrc ? <CodeComponent src={deferredSrc} props={{}} /> : null}
          </AppThemeProvider>
        </CodeComponentSandboxRoot>
      </ErrorBoundary>
    </React.Suspense>
  );
}
