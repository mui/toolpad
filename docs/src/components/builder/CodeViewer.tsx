import * as React from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import { HighlightedCode } from '@mui/docs/HighlightedCode';
import { Files } from 'create-toolpad-app';
import { styled, SxProps } from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  background: theme.vars.palette.background.default,
  borderRadius: theme.vars.shape.borderRadius,
  overflow: 'hidden',
  gap: theme.spacing(1),
}));

interface CodeViewerProps {
  sx?: SxProps;
  files?: Files;
}

interface TreeNode {
  path: string;
  label: string;
  children: TreeNode[];
}

function placePathInTree(tree: TreeNode[], item: string, prefix = '') {
  const [first, ...rest] = item.split('/');

  const path = `${prefix}${first}`;

  if (rest.length <= 0) {
    tree.push({ path, label: first, children: [] });
  } else {
    const node = tree.find((n) => n.label === first);
    if (node) {
      placePathInTree(node.children, rest.join('/'), `${path}/`);
    } else {
      tree.push({ path, label: first, children: [] });
    }
  }
}

function createTree(files: Files) {
  const tree: TreeNode[] = [];

  for (const [name] of files) {
    placePathInTree(tree, name);
  }

  return tree;
}

const getItemId = (item: TreeNode) => item.path;

export default function CodeViewer({ sx, files = new Map() }: CodeViewerProps) {
  const fileTree = React.useMemo(() => createTree(files), [files]);
  const [selectedPath, setSelectePath] = React.useState<string | null>(null);

  const contents = selectedPath ? files.get(selectedPath)?.content : null;

  return (
    <Root sx={sx}>
      <RichTreeView
        sx={{ width: 200, overflow: 'auto' }}
        items={fileTree}
        getItemId={getItemId}
        selectedItems={selectedPath}
        onSelectedItemsChange={(event, item) => setSelectePath(item)}
      />

      <Box sx={{ flex: 1, height: '100%', overflow: 'auto' }}>
        <HighlightedCode plainStyle copyButtonHidden language={'js'} code={contents ?? ''} />
      </Box>
    </Root>
  );
}
