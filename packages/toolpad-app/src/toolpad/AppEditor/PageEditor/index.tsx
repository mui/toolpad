import * as React from 'react';
import { styled } from '@mui/material';
import { useParams } from 'react-router-dom';
import { NodeId } from '@mui/toolpad-core';
import SplitPane from '../../../components/SplitPane';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { useDom, useDomApi } from '../../DomLoader';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useLocalStorageState from '../../../utils/useLocalStorageState';
import useDebouncedHandler from '../../../utils/useDebouncedHandler';
import useShortcut from '../../../utils/useShortcut';

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
  appId: string;
  node: appDom.PageNode;
}

function PageEditorContent({ appId, node }: PageEditorContentProps) {
  usePageTitle(`${node.attributes.title.value} | Toolpad editor`);

  const [splitDefaultSize, setSplitDefaultSize] = useLocalStorageState<number>(
    `editor/${appId}/component-panel-split`,
    300,
  );

  const handleSplitChange = useDebouncedHandler((newSize) => setSplitDefaultSize(newSize), 100);

  return (
    <PageEditorProvider key={node.id} appId={appId} nodeId={node.id}>
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
  appId: string;
}

export default function PageEditor({ appId }: PageEditorProps) {
  const { dom } = useDom();
  const domApi = useDomApi();
  const { nodeId } = useParams();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, () => {
    domApi.undo();
  });
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, () => {
    domApi.redo();
  });

  return pageNode ? (
    <PageEditorContent appId={appId} node={pageNode} />
  ) : (
    <NotFoundEditor message={`Non-existing Page "${nodeId}"`} />
  );
}
