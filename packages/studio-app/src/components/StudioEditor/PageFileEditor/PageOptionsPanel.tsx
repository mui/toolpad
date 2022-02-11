import { Stack, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import * as React from 'react';
import CodeIcon from '@mui/icons-material/Code';
import PageIcon from '@mui/icons-material/Web';
import SourceIcon from '@mui/icons-material/Source';
import renderPageCode from '../../../renderPageCode';
import useLatest from '../../../utils/useLatest';
import { useDom } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import DerivedStateEditor from './DerivedStateEditor';
import QueryStateEditor from './QueryStateEditor';
import FetchedStateEditor from './FetchedStateEditor';

export default function PageOptionsPanel() {
  const dom = useDom();
  const state = usePageEditorState();
  const pageNodeId = state.nodeId;

  const [viewedSource, setViewedSource] = React.useState<string | null>(null);

  const handleViewSource = React.useCallback(() => {
    const { code } = renderPageCode(dom, pageNodeId, { pretty: true });
    setViewedSource(code);
  }, [dom, pageNodeId]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  // To keep it around during closing animation
  const dialogSourceContent = useLatest(viewedSource);

  return (
    <div>
      <Stack spacing={1} alignItems="start">
        <Button
          startIcon={<PageIcon />}
          color="inherit"
          component="a"
          href={`/pages/${pageNodeId}`}
        >
          View Page
        </Button>
        <Button startIcon={<SourceIcon />} color="inherit" onClick={handleViewSource}>
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
        <DerivedStateEditor />
        <QueryStateEditor />
        <FetchedStateEditor pageNodeId={pageNodeId} />
      </Stack>
      <Dialog fullWidth maxWidth="lg" open={!!viewedSource} onClose={handleViewedSourceDialogClose}>
        <DialogTitle>Page component</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
