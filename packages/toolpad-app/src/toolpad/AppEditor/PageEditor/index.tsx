import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import useDebouncedHandler from '@mui/toolpad-utils/hooks/useDebouncedHandler';
import SplitPane from '../../../components/SplitPane';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { useDom } from '../../AppState';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import usePageTitle from '../../../utils/usePageTitle';
import useLocalStorageState from '../../../utils/useLocalStorageState';
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

  const [splitDefaultSize, setSplitDefaultSize] = useLocalStorageState<number>(
    `editor/component-panel-split`,
    300,
  );

  const handleSplitChange = useDebouncedHandler(
    (newSize: number) => setSplitDefaultSize(newSize),
    100,
  );

  return (
    <SplitPane
      allowResize
      split="vertical"
      size={splitDefaultSize}
      defaultSize={splitDefaultSize}
      onChange={handleSplitChange}
      primary="second"
      sx={{
        '& .Resizer.vertical': {
          width: '3px',
          border: 0,
          margin: 0,
          zIndex: 0,
          transition: (theme) => theme.transitions.create('all', { duration: 100 }),
        },
        '& .Resizer.vertical:hover': {
          border: 0,
          margin: 0,
        },
        '& .Pane2': {
          zIndex: 0,
        },
      }}
    >
      <PageEditorRoot>
        <ComponentCatalog />
        <RenderPanel className={classes.renderPanel} />
      </PageEditorRoot>
      <ComponentPanel />
    </SplitPane>
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
