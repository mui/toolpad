import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';
import StudioSandbox, { StudioSandboxHandle } from '../StudioSandbox';
import getImportMap from '../../getImportMap';

const PageViewRoot = styled('div')({
  overflow: 'auto',
});

const appIndex = `
  import * as React from 'react';
  import * as ReactDOM from 'react-dom';
  import Page from './page.js';

  // Poor man's refresh implementation
  if (import.meta.hot) {
    if (!import.meta.hot.data.isRefresh) {
      ReactDOM.render(React.createElement(Page), document.getElementById('root'));
    }

    import.meta.hot.accept(['./page.js'], ({ module, deps }) => {
      ReactDOM.render(React.createElement(deps[0].default), document.getElementById('root'));
    });

    import.meta.hot.dispose(() => {
      import.meta.hot.data.isRefresh = true;
    });
  } else {
    ReactDOM.render(React.createElement(Page), document.getElementById('root'));
  }
`;

export interface PageViewHandle {
  getRootElm: () => HTMLElement | null;
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
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
      transforms: ['jsx', 'typescript'],
    });
  }, [page]);

  console.log(renderedPage.code);

  return (
    <PageViewRoot className={className}>
      <StudioSandbox
        ref={frameRef}
        onAfterRender={onAfterRender}
        base="/app/1234"
        importMap={getImportMap()}
        files={{
          '/index.js': { code: appIndex },
          '/page.js': { code: renderedPage.code },
        }}
        entry="/index.js"
      />
    </PageViewRoot>
  );
});
