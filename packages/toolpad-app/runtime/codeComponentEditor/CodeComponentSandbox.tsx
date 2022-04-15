import { styled } from '@mui/material';
import * as React from 'react';
import AppThemeProvider from '../pageEditor/AppThemeProvider';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <React.Fragment>{this.state.error.message}</React.Fragment>;
    }

    return this.props.children;
  }
}

export interface CodeComponentSandboxBridge {
  updateCodeCompoent: (newNode: string) => void;
}

declare global {
  interface Window {
    __CODE_COMPONENT_SANDBOX_READY__?: boolean | (() => void);
    __CODE_COMPONENT_SANDBOX_BRIDGE__?: CodeComponentSandboxBridge;
  }
}

function Noop() {
  return null;
}

const CodeComponentSandboxRoot = styled('div')({});

export default function CodeComponentSandbox() {
  const [codeComponentSrc, setCodeComponentSrc] = React.useState<string | null>(null);
  const [Component, setComponent] = React.useState<React.ComponentType>(() => Noop);
  const [errorBoundaryKey, seterrorBoundaryKey] = React.useState(1);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__CODE_COMPONENT_SANDBOX_BRIDGE__ = {
      updateCodeCompoent: (component) => setCodeComponentSrc(component),
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

  React.useEffect(() => {
    if (!codeComponentSrc) {
      return () => {};
    }

    const importUrl = URL.createObjectURL(
      new Blob([codeComponentSrc], {
        type: 'application/javascript',
      }),
    );

    import(importUrl).then((mod) => {
      // eslint-disable-next-line no-underscore-dangle
      if (window.__TOOLPAD_EDITOR_UPDATE_COMPONENT_CONFIG__) {
        // eslint-disable-next-line no-underscore-dangle
        window.__TOOLPAD_EDITOR_UPDATE_COMPONENT_CONFIG__(mod.config);
      }
      setComponent(() => mod.default);
      seterrorBoundaryKey((key) => key + 1);
    });

    return () => URL.revokeObjectURL(importUrl);
  }, [codeComponentSrc]);

  return (
    <ErrorBoundary key={errorBoundaryKey}>
      <CodeComponentSandboxRoot>
        <AppThemeProvider node={null}>
          <Component />
        </AppThemeProvider>
      </CodeComponentSandboxRoot>
    </ErrorBoundary>
  );
}
