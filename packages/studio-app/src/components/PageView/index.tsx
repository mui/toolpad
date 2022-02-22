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
  editor?: boolean;
  onLoad?: (window: Window) => void;
  dom: studioDom.StudioDom;
  pageNodeId: NodeId;
}

export default function PageView({ className, editor, dom, pageNodeId, onLoad }: PageViewProps) {
  const themePath = './lib/theme.ts';
  const entryPath = `./${pageNodeId}.tsx`;
  const pagePath = `./pages/${pageNodeId}.tsx`;

  const renderedPage = React.useMemo(() => {
    return renderPageCode(dom, pageNodeId, { editor });
  }, [dom, pageNodeId, editor]);

  const renderedTheme = React.useMemo(() => {
    return renderThemeCode(dom, { editor });
  }, [dom, editor]);

  const renderedEntrypoint = React.useMemo(() => {
    return renderEntryPoint({
      pagePath,
      themePath,
      editor,
    });
  }, [pagePath, themePath, editor]);

  const codeComponentsFiles = React.useMemo(() => {
    const app = studioDom.getApp(dom);
    const { codeComponents = [] } = studioDom.getChildNodes(dom, app);
    // TODO: only render the components that were used on the page?
    return Object.fromEntries(
      codeComponents.map((component) => [
        `./components/${component.id}.tsx`,
        { code: component.attributes.code.value },
      ]),
    );
  }, [dom]);

  const derivedStateHookFiles = React.useMemo(() => {
    const page = studioDom.getNode(dom, pageNodeId, 'page');
    const { derivedStates = [] } = studioDom.getChildNodes(dom, page);
    return Object.fromEntries(
      derivedStates.map((derivedState) => [
        `./derivedState/${derivedState.id}.ts`,
        { code: derivedState.attributes.code.value },
      ]),
    );
  }, [dom, pageNodeId]);

  return (
    <StudioSandbox
      className={className}
      onLoad={onLoad}
      base={`/app/${dom.root}/`}
      importMap={getImportMap()}
      files={{
        ...codeComponentsFiles,
        ...derivedStateHookFiles,
        [themePath]: { code: renderedTheme.code },
        [entryPath]: { code: renderedEntrypoint.code },
        [pagePath]: { code: renderedPage.code },
      }}
      entry={entryPath}
    />
  );
}
