import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import * as React from 'react';
import CodeIcon from '@mui/icons-material/Code';
import PageIcon from '@mui/icons-material/Web';
import SourceIcon from '@mui/icons-material/Source';
import renderPageCode from '../../../renderPageCode';
import { useDom } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import DerivedStateEditor from './DerivedStateEditor';
import QueryStateEditor from './QueryStateEditor';
import UrlQueryEditor from './UrlQueryEditor';
import { NodeId } from '../../../types';
import NodeNameEditor from './NodeNameEditor';
import * as studioDom from '../../../studioDom';

// TODO: remove deprecated state
const DEPRECATED = true;

interface PageSourceProps {
  pageNodeId: NodeId;
  editor?: boolean;
}

function PageSource({ pageNodeId, editor }: PageSourceProps) {
  const dom = useDom();

  const source = React.useMemo(() => {
    const { code } = renderPageCode(dom, pageNodeId, { pretty: true, editor });
    return code;
  }, [dom, editor, pageNodeId]);

  return <pre>{source}</pre>;
}

export default function PageOptionsPanel() {
  const state = usePageEditorState();
  const pageNodeId = state.nodeId;
  const dom = useDom();

  const page = studioDom.getNode(dom, pageNodeId, 'page');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [debugEditor, setDebugEditor] = React.useState(false);

  return (
    <div>
      <Stack spacing={1} alignItems="start">
        <NodeNameEditor node={page} />
        <Button
          startIcon={<PageIcon />}
          color="inherit"
          component="a"
          href={`/pages/${pageNodeId}`}
        >
          View Page
        </Button>
        <Button startIcon={<SourceIcon />} color="inherit" onClick={() => setDialogOpen(true)}>
          View Page Source
        </Button>
        <Button
          startIcon={<CodeIcon />}
          color="inherit"
          component="a"
          href={`/api/export/${pageNodeId}`}
        >
          Page Component
        </Button>
        <UrlQueryEditor pageNodeId={pageNodeId} />
        {DEPRECATED && <DerivedStateEditor />}
        <QueryStateEditor />
      </Stack>
      <Dialog fullWidth maxWidth="lg" open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Page component</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={debugEditor}
                onChange={(event) => setDebugEditor(event.target.checked)}
              />
            }
            label="editor"
          />
          <PageSource pageNodeId={pageNodeId} editor={debugEditor} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
