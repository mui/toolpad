import * as React from 'react';
import { styled } from '@mui/material';
import usePageTitle from '@mui/toolpad-utils/hooks/usePageTitle';
import * as appDom from '@mui/toolpad-core/appDom';
import { Panel, PanelGroup, PanelResizeHandle } from '../../../components/resizablePanels';
import RenderPanel from './RenderPanel';
import { PageEditorProvider } from './PageEditorProvider';
import ComponentPanel from './ComponentPanel';
import { useAppState } from '../../AppState';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import useUndoRedo from '../../hooks/useUndoRedo';
import QueryEditor from './QueryEditor';

const classes = {
  renderPanel: 'Toolpad_RenderPanel',
};

const PageEditorRoot = styled('div')({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  [`& .${classes.renderPanel}`]: {
    flex: 1,
  },
});

interface PageEditorContentProps {
  node: appDom.PageNode;
}

function PageEditorContent({ node }: PageEditorContentProps) {
  usePageTitle(`${appDom.getPageTitle(node)} | Toolpad editor`);
  const { currentView } = useAppState();
  const showQuery =
    currentView.kind === 'page' &&
    currentView.view?.kind === 'query' &&
    currentView.queryPanel?.queryTabs;

  return (
    <PageEditorProvider key={node.id} nodeId={node.id}>
      <PanelGroup autoSaveId="toolpad/editor-panel-split" direction="vertical">
        <Panel order={1} id="editor">
          <PanelGroup autoSaveId="editor/component-panel-split" direction="horizontal">
            <Panel id="page-editor" defaultSize={75} minSize={50} maxSize={80}>
              <PageEditorRoot>
                {appDom.isCodePage(node) ? null : <ComponentCatalog />}
                <RenderPanel className={classes.renderPanel} />
              </PageEditorRoot>
            </Panel>
            <PanelResizeHandle />
            <Panel id="component-panel" defaultSize={25} maxSize={50} minSize={20}>
              <ComponentPanel />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />

        {showQuery ? (
          <Panel minSize={10} maxSize={90} defaultSize={35} order={2} id="query-panel">
            <QueryEditor />
          </Panel>
        ) : null}
      </PanelGroup>
    </PageEditorProvider>
  );
}

interface PageEditorProps {
  name: string;
}

export default function PageEditor({ name }: PageEditorProps) {
  const { dom } = useAppState();
  const pageNode = React.useMemo(() => appDom.getPageByName(dom, name), [dom, name]);

  useUndoRedo();

  return pageNode ? (
    <PageEditorContent node={pageNode} />
  ) : (
    <NotFoundEditor message={`Non-existing Page "${name}"`} />
  );
}
