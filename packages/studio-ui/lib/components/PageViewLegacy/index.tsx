import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import PageContext from './PageContext';
import RenderedNode from './RenderedNode';

const PageViewRoot = styled('div')({});

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
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => onAfterRender?.(), [page, onAfterRender]);

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return rootRef.current;
    },
  }));

  return (
    <PageViewRoot ref={rootRef} className={className}>
      <PageContext.Provider value={page}>
        <RenderedNode nodeId={page.root} />
      </PageContext.Provider>
    </PageViewRoot>
  );
});
