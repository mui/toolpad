import * as React from 'react';
import { NodeId } from '../../types';
import * as studioDom from '../../studioDom';
import renderPageCode from '../../renderPageCode';
import StudioSandbox from '../StudioSandbox';
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
  // Callback for when the view has rendered. Make sure this value is stable
  onLoad?: (window: Window) => void;
  dom: studioDom.StudioDom;
  pageNodeId: NodeId;
}

export default function PageView({ className, dom, pageNodeId, onLoad }: PageViewProps) {
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

  return (
    <StudioSandbox
      className={className}
      onLoad={onLoad}
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
}
