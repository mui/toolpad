import { styled } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as appDom from '../../../appDom';
import useLatest from '../../../utils/useLatest';
import AppThemeProvider from '../../../runtime/AppThemeProvider';
import createCodeComponent from '../../../runtime/createCodeComponent';

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

export interface CodeComponentSandboxProps {
  themeNode?: appDom.ThemeNode;
  src: string;
}

export default function CodeComponentSandbox({ themeNode, src }: CodeComponentSandboxProps) {
  const { Component: GeneratedComponent, error: compileError } = useCodeComponent(src);

  const CodeComponent: React.ComponentType<any> = useLatest(GeneratedComponent) || Noop;

  return (
    <React.Suspense fallback={null}>
      <ErrorBoundary
        resetKeys={[CodeComponent]}
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
