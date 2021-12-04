import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';
import StudioSandbox, { StudioSandboxHandle } from '../StudioSandbox';

const PageViewRoot = styled('div')({
  overflow: 'auto',
});

const appIndex = `
  if (window.__HMR) {
    import.meta.hot = window.__HMR.createHotContext(import.meta.url);
  }

  import * as React from 'react';
  import * as ReactDOM from 'react-dom';
  import Page from './page.js';

  ReactDOM.render(React.createElement(Page), document.getElementById('root'));

  if (import.meta.hot) {
    import.meta.hot.accept(({ module }) => {
      try {
        // do nothing
      } catch (err) {
        import.meta.hot.invalidate();
      }
    });
    import.meta.hot.dispose(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('root'))
    });
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

  return (
    <PageViewRoot className={className}>
      <StudioSandbox
        ref={frameRef}
        code={renderedPage.code}
        onAfterRender={onAfterRender}
        files={{
          '/index.js': appIndex,
          '/page.js': renderedPage.code,
        }}
        entry="/index.js"
      />
    </PageViewRoot>
  );
});
