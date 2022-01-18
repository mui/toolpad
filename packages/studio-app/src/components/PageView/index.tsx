import * as React from 'react';
import { NodeId } from '../../types';
import * as studioDom from '../../studioDom';
import renderPageCode from '../../renderPageCode';
import StudioSandbox from '../StudioSandbox';
import getImportMap from '../../getImportMap';
import renderThemeCode from '../../renderThemeCode';
import renderEntryPoint from '../../renderPageEntryCode';

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onLoad?: (window: Window) => void;
  dom: studioDom.StudioDom;
  pageNodeId: NodeId;
}

export default function PageView({ className, dom, pageNodeId, onLoad }: PageViewProps) {
  const themePath = './lib/theme.js';
  const entryPath = `./${pageNodeId}.js`;
  const pagePath = `./pages/${pageNodeId}.js`;

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

  const renderedEntrypoint = React.useMemo(() => {
    return renderEntryPoint({
      pagePath,
      themePath,
      editor: true,
    });
  }, [pagePath, themePath]);

  return (
    <StudioSandbox
      className={className}
      onLoad={onLoad}
      base={`/app/${dom.root}/`}
      importMap={getImportMap()}
      files={{
        [themePath]: { code: renderedTheme.code },
        [entryPath]: { code: renderedEntrypoint.code },
        [pagePath]: { code: renderedPage.code },
      }}
      entry={entryPath}
    />
  );
}
