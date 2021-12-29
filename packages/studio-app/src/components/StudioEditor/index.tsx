import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { createEditorState } from '../../editorState';
import { StudioPage } from '../../types';
import PageProvider from '../PageStateProvider';
import StudioAppBar from '../StudioAppBar';
import BindingEditor from './BindingEditor';
import ComponentPanel from './ComponentPanel';
import EditorProvider, { useEditorState } from './EditorProvider';
import StudioViewEditor from './StudioViewEditor';
import PagePanel from './PagePanel';
import renderPageAsCode from '../../renderPageAsCode';
import useLatest from '../../utils/useLatest';
import client from '../../api';

const classes = {
  content: 'StudioContent',
  componentPanel: 'StudioComponentPanel',
  renderPanel: 'StudioRenderPanel',
  pagePanel: 'StudioPagePanel',
};

const EditorRoot = styled('div')(({ theme }) => ({
  height: '100vh',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [`& .${classes.content}`]: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  [`& .${classes.pagePanel}`]: {
    width: 250,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.renderPanel}`]: {
    flex: 1,
  },
  [`& .${classes.componentPanel}`]: {
    width: 300,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

function EditorContent() {
  const state = useEditorState();
  const router = useRouter();

  const [viewedSource, setViewedSource] = React.useState<string | null>(null);

  const handleSave = React.useCallback(async () => {
    try {
      await client.mutation.updatePage(state.page);
      router.push(`/${state.page.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }, [router, state.page]);

  const handleViewSource = React.useCallback(() => {
    const { code } = renderPageAsCode(state.page, { pretty: true });
    setViewedSource(code);
  }, [state.page]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  // To keep it around during closing animation
  const dialogSourceContent = useLatest(viewedSource);

  return (
    <PageProvider page={state.page}>
      <StudioAppBar
        actions={
          <React.Fragment>
            <IconButton color="inherit" onClick={handleViewSource}>
              <CodeIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </React.Fragment>
        }
      />
      <div className={classes.content}>
        <PagePanel className={classes.pagePanel} />
        <StudioViewEditor className={classes.renderPanel} />
        <ComponentPanel className={classes.componentPanel} />
      </div>
      <BindingEditor />
      <Dialog fullWidth maxWidth="lg" onClose={handleViewedSourceDialogClose} open={!!viewedSource}>
        <DialogTitle>View Source</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
    </PageProvider>
  );
}

interface EditorProps {
  page: StudioPage;
}

export default function Editor({ page }: EditorProps) {
  const initialState = React.useMemo(() => createEditorState(page), [page]);
  return (
    <EditorRoot>
      <EditorProvider initialState={initialState}>
        <EditorContent />
      </EditorProvider>
    </EditorRoot>
  );
}
