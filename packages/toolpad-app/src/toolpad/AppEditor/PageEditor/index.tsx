import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import { Panel, PanelGroup, PanelResizeHandle } from '../../../components/resizablePanels';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { useAppState } from '../../AppState';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useUndoRedo from '../../hooks/useUndoRedo';

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
  usePageTitle(`${node.attributes.title} | Toolpad editor`);

  return (
    <PageEditorProvider key={node.id} nodeId={node.id}>
      <PanelGroup autoSaveId="editor/component-panel-split" direction="horizontal">
        <Panel defaultSize={75} minSize={50} maxSize={80}>
          <PageEditorRoot>
            <ComponentCatalog />
            <RenderPanel className={classes.renderPanel} />
          </PageEditorRoot>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={25} maxSize={50} minSize={20}>
          <ComponentPanel />
        </Panel>
      </PanelGroup>
    </PageEditorProvider>
  );
}

interface PageEditorProps {
  nodeId?: NodeId;
}

export default function PageEditor({ nodeId }: PageEditorProps) {
  const { dom } = useAppState();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');

  useUndoRedo();

  return pageNode ? (
    <PageEditorContent node={pageNode} />
  ) : (
    <NotFoundEditor message={`Non-existing Page "${nodeId}"`} />
  );
}
