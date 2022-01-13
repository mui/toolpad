import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import * as studioDom from '../../studioDom';
import StudioAppBar from '../StudioAppBar';
import EditorProvider, { createEditorState, useEditorState } from './EditorProvider';
import PageFileEditor from './PageFileEditor';
import PagePanel from './PagePanel';
import renderPageCode from '../../renderPageCode';
import useLatest from '../../utils/useLatest';
import client from '../../api';
import DomProvider, { useDom } from '../DomProvider';

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

interface ToDoEditorProps {
  className?: string;
}

function ToDoFileEditor({ className }: ToDoEditorProps) {
  return <div className={className}>To Do</div>;
}

interface FileEditorProps {
  className?: string;
  type: 'page' | 'api' | 'theme';
}

function FileEditor({ type, className }: FileEditorProps) {
  switch (type) {
    case 'page':
      return <PageFileEditor className={className} />;
    default:
      return <ToDoFileEditor className={className} />;
  }
}

function EditorContent() {
  const state = useEditorState();
  const dom = useDom();

  const [viewedSource, setViewedSource] = React.useState<string | null>(null);

  const handleSave = React.useCallback(async () => {
    try {
      await client.mutation.saveApp(dom);
    } catch (err: any) {
      alert(err.message);
    }
  }, [dom]);

  const handleViewSource = React.useCallback(() => {
    if (state.editorType !== 'page') {
      setViewedSource(`
      // not yet supported
      `);
      return;
    }
    const { code } = renderPageCode(dom, state.pageEditor.nodeId, { pretty: true });
    setViewedSource(code);
  }, [state, dom]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  // To keep it around during closing animation
  const dialogSourceContent = useLatest(viewedSource);

  return (
    <React.Fragment>
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
        <FileEditor type={state.editorType} className={classes.renderPanel} />
      </div>
      <Dialog fullWidth maxWidth="lg" onClose={handleViewedSourceDialogClose} open={!!viewedSource}>
        <DialogTitle>View Source</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

interface EditorProps {
  dom: studioDom.StudioDom;
}

export default function Editor({ dom }: EditorProps) {
  const initialState = React.useMemo(() => createEditorState(dom), [dom]);
  return (
    <EditorRoot>
      <DomProvider initialDom={dom}>
        <EditorProvider initialState={initialState}>
          <EditorContent />
        </EditorProvider>
      </DomProvider>
    </EditorRoot>
  );
}
