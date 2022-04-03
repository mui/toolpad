import * as React from 'react';
import { NodeId } from '../../types';
import * as appDom from '../../appDom';
import renderPageCode from '../../renderPageCode';
import StudioSandbox from '../StudioSandbox';
import getImportMap from '../../getImportMap';
import renderThemeCode from '../../renderThemeCode';
import renderEntryPoint from '../../renderPageEntryCode';

export interface PageViewProps {
  className?: string;
  editor?: boolean;
  onLoad?: (window: Window) => void;
  appId: string;
  dom: appDom.AppDom;
  pageNodeId: NodeId;
}

export default function PageView({
  appId,
  className,
  editor,
  dom,
  pageNodeId,
  onLoad,
}: PageViewProps) {
  const themePath = './lib/theme.ts';
  const entryPath = `./${pageNodeId}.tsx`;
  const pagePath = `./pages/${pageNodeId}.tsx`;

  const renderedPage = React.useMemo(() => {
    return renderPageCode(appId, dom, pageNodeId, { editor });
  }, [appId, dom, pageNodeId, editor]);

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
    const app = appDom.getApp(dom);
    const { codeComponents = [] } = appDom.getChildNodes(dom, app);
    // TODO: only render the components that were used on the page?
    return Object.fromEntries(
      codeComponents.map((component) => [
        `./components/${component.id}.tsx`,
        { code: component.attributes.code.value },
      ]),
    );
  }, [dom]);

  const derivedStateHookFiles = React.useMemo(() => {
    const page = appDom.getNode(dom, pageNodeId, 'page');
    const { derivedStates = [] } = appDom.getChildNodes(dom, page);
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
      base={`/app/${appId}/${dom.root}/`}
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
