import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  DialogActions,
} from '@mui/material';
import * as React from 'react';
import PageIcon from '@mui/icons-material/Web';
import SourceIcon from '@mui/icons-material/Source';
import renderPageCode from '../../../renderPageCode';
import { useDom } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import DerivedStateEditor from './DerivedStateEditor';
import QueryStateEditor from './QueryStateEditor';
import UrlQueryEditor from './UrlQueryEditor';
import { NodeId } from '../../../types';
import NodeNameEditor from '../NodeNameEditor';
import * as appDom from '../../../appDom';

// TODO: remove deprecated state
const DEPRECATED = false;

interface PageSourceProps {
  appId: string;
  pageNodeId: NodeId;
  editor?: boolean;
}

function PageSource({ appId, pageNodeId, editor }: PageSourceProps) {
  const dom = useDom();

  const source = React.useMemo(() => {
    const { code } = renderPageCode(appId, dom, pageNodeId, { pretty: true, editor });
    return code;
  }, [appId, dom, editor, pageNodeId]);

  return <pre>{source}</pre>;
}

export default function PageOptionsPanel() {
  const state = usePageEditorState();
  const pageNodeId = state.nodeId;
  const dom = useDom();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [debugEditor, setDebugEditor] = React.useState(false);

  return (
    <div>
      <Stack spacing={1} alignItems="start">
        <Typography variant="subtitle1">Page:</Typography>
        <NodeNameEditor node={page} />
        <Button
          startIcon={<PageIcon />}
          color="inherit"
          component="a"
          href={`/api/release/${state.appId}/preview/${pageNodeId}`}
        >
          Preview
        </Button>
        <Button startIcon={<SourceIcon />} color="inherit" onClick={() => setDialogOpen(true)}>
          View Source
        </Button>
        <Divider variant="middle" sx={{ alignSelf: 'stretch' }} />
        <Typography variant="subtitle1">Page State:</Typography>
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
          <PageSource pageNodeId={pageNodeId} editor={debugEditor} appId={state.appId} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
