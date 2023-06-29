import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TreeItem from '@mui/lab/TreeItem';
import { useLocation } from 'react-router-dom';
import * as appDom from '../../../appDom';
import { useAppState, useDom } from '../../AppState';
import { getViewFromPathname } from '../../../utils/domView';

export default function PageStructureExplorer() {
  const { dom } = useDom();
  const location = useLocation();
  const { currentView } = useAppState();

  const activePage = currentView.kind === 'page' ? currentView.nodeId : null;

  const { pages = [] } = appDom.getChildNodes(dom, activePage);
  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      <TreeItem nodeId="1" label="Applications">
        <TreeItem nodeId="2" label="Calendar" />
      </TreeItem>
      <TreeItem nodeId="5" label="Documents">
        <TreeItem nodeId="10" label="OSS" />
        <TreeItem nodeId="6" label="MUI">
          <TreeItem nodeId="8" label="index.js" />
        </TreeItem>
      </TreeItem>
    </TreeView>
  );
}
