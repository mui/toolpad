import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';
import StudioSandbox, { StudioSandboxHandle } from '../StudioSandbox';
import getImportMap from '../../getImportMap';

const PageViewRoot = styled('div')({
  overflow: 'auto',
});

const theme = `
import { createTheme } from '@mui/material/styles';
import { green, orange } from '@mui/material/colors';

export default createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
    secondary: {
      main: green[500],
    },
  },
})
`;

const appIndex = `
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ThemeProvider } from '@mui/material/styles';
import Page from './page.js';
import theme from './lib/theme.js';
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function render (Page, theme) {
  ReactDOM.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
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
  onUpdate?: () => void;
  page: StudioPage;
}

export default React.forwardRef(function PageView(
  { className, page, onUpdate }: PageViewProps,
  ref: React.ForwardedRef<PageViewHandle>,
) {
  const frameRef = React.useRef<StudioSandboxHandle>(null);

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return frameRef.current?.getRootElm() ?? null;
    },
  }));

  const renderedPage = React.useMemo(() => {
    return renderPageAsCode(page, {
      editor: true,
      inlineQueries: true,
    });
  }, [page]);

  return (
    <PageViewRoot className={className}>
      <StudioSandbox
        ref={frameRef}
        onUpdate={onUpdate}
        base="/app/1234"
        importMap={getImportMap()}
        files={{
          '/lib/theme.js': { code: theme },
          '/index.js': { code: appIndex },
          '/page.js': { code: renderedPage.code },
        }}
        entry="/index.js"
      />
    </PageViewRoot>
  );
});
