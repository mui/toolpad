import * as React from 'react';
import mitt from 'mitt';
import { NodeId, StudioBridge } from '../../types';
import * as studioDom from '../../studioDom';
import renderPageCode from '../../renderPageCode';
import StudioSandbox, { StudioSandboxHandle } from '../StudioSandbox';
import getImportMap from '../../getImportMap';
import renderThemeCode from '../../renderThemeCode';

const appIndex = `
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Page from './page.js';
import theme from './lib/theme.js';
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient();

function render (Page, theme) {
  const appTheme = createTheme(theme);
  ReactDOM.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <Page />
      </ThemeProvider>
    </QueryClientProvider>, 
    document.getElementById('root')
  );
}

// Poor man's refresh implementation
// TODO: react-refresh implementation, move to worker
if (import.meta.hot) {
  if (!import.meta.hot.data.isRefresh) {
    render(Page, theme);
  }

  import.meta.hot.accept(['./page.js', './lib/theme.js'], ({ module, deps }) => {
    const [{ default: Page }, { default: theme }] = deps 
    render(Page, theme);
  });

  import.meta.hot.dispose(() => {
    import.meta.hot.data.isRefresh = true;
  });
} else {
  render(Page, theme);
}
`;

export interface PageViewHandle {
  getRootElm: () => HTMLElement | null;
}

export interface PageViewProps {
  className?: string;
  dom: studioDom.StudioDom;
  pageNodeId: NodeId;
  resizeWithContent?: boolean;
}

export default React.forwardRef(function PageView(
  { className, dom, pageNodeId, resizeWithContent }: PageViewProps,
  ref: React.ForwardedRef<PageViewHandle>,
) {
  const frameRef = React.useRef<StudioSandboxHandle>(null);

  const renderedPage = React.useMemo(() => {
    return renderPageCode(dom, pageNodeId, {
      editor: true,
    });
  }, [dom, pageNodeId]);

  const renderedTheme = React.useMemo(() => {
    return renderThemeCode(dom, {
      editor: true,
    });
  }, [dom]);

  const bridgeProxy = React.useRef<StudioBridge>({
    events: mitt(),
    getViewState: () => ({}),
    setSelection: () => {},
    getRootElm: () => null,
  });

  const bridgeRef = React.useRef<StudioBridge | null>(null);
  const handleLoad = React.useCallback((window: Window) => {
    // eslint-disable-next-line no-underscore-dangle
    const bridge = window.__STUDIO;
    if (bridge) {
      if (bridgeRef.current) {
        bridgeRef.current.events.all.clear();
      }

      bridgeRef.current = bridge;
      const { events, ...rest } = bridge;
      Object.assign(bridgeProxy.current, rest);
      events.on('*', (type, event) => bridgeProxy.current.events.emit(type, event));
    }
  }, []);

  React.useImperativeHandle(ref, () => bridgeProxy.current);

  return (
    <StudioSandbox
      className={className}
      ref={frameRef}
      resizeWithContent={resizeWithContent}
      onLoad={handleLoad}
      base="/app/1234"
      importMap={getImportMap()}
      files={{
        '/lib/theme.js': { code: renderedTheme.code },
        '/index.js': { code: appIndex },
        '/page.js': { code: renderedPage.code },
      }}
      entry="/index.js"
    />
  );
});
