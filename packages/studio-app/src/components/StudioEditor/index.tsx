import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import { CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import StudioAppBar from '../StudioAppBar';
import EditorProvider, {
  ApiEditorState,
  createEditorState,
  PageEditorState,
  useEditorState,
} from './EditorProvider';
import PageFileEditor from './PageFileEditor';
import PagePanel from './PagePanel';
import renderPageCode from '../../renderPageCode';
import useLatest from '../../utils/useLatest';
import client from '../../api';
import DomProvider, { useDom, useDomState } from '../DomProvider';
import ApiFileEditor from './ApiFileEditor';

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
  editor: PageEditorState | ApiEditorState | null;
}

function FileEditor({ editor, className }: FileEditorProps) {
  if (!editor) {
    return <ToDoFileEditor className={className} />;
  }
  switch (editor.type) {
    case 'page':
      return <PageFileEditor key={editor.nodeId} className={className} />;
    case 'api':
      return <ApiFileEditor key={editor.nodeId} className={className} />;
    default:
      throw new Error(`Invariant: unrecognized file editor "${(editor as any).type}"`);
  }
}

function EditorContent() {
  const state = useEditorState();
  const domState = useDomState();
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
    const { code } = renderPageCode(dom, state.editor.nodeId, { pretty: true });
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
        {
          // eslint-disable-next-line no-nested-ternary
          domState.loading ? (
            <CircularProgress />
          ) : domState.error ? (
            domState.error
          ) : (
            <React.Fragment>
              <PagePanel className={classes.pagePanel} />
              <FileEditor editor={state.editor} className={classes.renderPanel} />
            </React.Fragment>
          )
        }
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
export default function Editor() {
  const initialState = React.useMemo(() => createEditorState(), []);
  return (
    <DomProvider>
      <EditorRoot>
        <EditorProvider initialState={initialState}>
          <EditorContent />
        </EditorProvider>
      </EditorRoot>
    </DomProvider>
  );
}
