import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import SplitPane from '../../../components/SplitPane';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { useDom } from '../../AppState';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useLocalStorageState from '../../../utils/useLocalStorageState';
import useDebouncedHandler from '../../../utils/useDebouncedHandler';
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
  usePageTitle(`${node.attributes.title.value} | Toolpad editor`);

  const [splitDefaultSize, setSplitDefaultSize] = useLocalStorageState<number>(
    `editor/component-panel-split`,
    300,
  );

  const handleSplitChange = useDebouncedHandler((newSize) => setSplitDefaultSize(newSize), 100);

  return (
    <PageEditorProvider key={node.id} nodeId={node.id}>
      <SplitPane
        allowResize
        split="vertical"
        size={splitDefaultSize}
        defaultSize={splitDefaultSize}
        onChange={handleSplitChange}
        primary="second"
      >
        <PageEditorRoot>
          <ComponentCatalog />
          <RenderPanel className={classes.renderPanel} />
        </PageEditorRoot>
        <ComponentPanel />
      </SplitPane>
    </PageEditorProvider>
  );
}

interface PageEditorProps {
  nodeId?: NodeId;
}

export default function PageEditor({ nodeId }: PageEditorProps) {
  const { dom } = useDom();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');

  useUndoRedo();

  return pageNode ? (
    <PageEditorContent node={pageNode} />
  ) : (
    <NotFoundEditor message={`Non-existing Page "${nodeId}"`} />
  );
}
