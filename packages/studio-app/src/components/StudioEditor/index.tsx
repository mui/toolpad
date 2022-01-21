import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { CircularProgress, IconButton } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudioAppBar from '../StudioAppBar';
import PageFileEditor from './PageFileEditor';
import PagePanel from './PagePanel';
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
}

function FileEditor({ className }: FileEditorProps) {
  const domState = useDomState();
  return domState.loaded ? (
    <Routes>
      <Route path="pages/:pageNodeId" element={<PageFileEditor className={className} />} />
      <Route path="apis/:apiNodeId" element={<ApiFileEditor className={className} />} />
      <Route
        path="codeComponents/:componentNodeId"
        element={<ToDoFileEditor className={className} />}
      />
    </Routes>
  ) : (
    <CircularProgress />
  );
}

function EditorContent() {
  const dom = useDom();

  const handleSave = React.useCallback(async () => {
    try {
      await client.mutation.saveApp(dom);
    } catch (err: any) {
      alert(err.message);
    }
  }, [dom]);

  return (
    <EditorRoot>
      <StudioAppBar
        actions={
          <React.Fragment>
            <IconButton color="inherit" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </React.Fragment>
        }
      />
      <div className={classes.content}>
        <PagePanel className={classes.pagePanel} />
        <FileEditor className={classes.renderPanel} />
      </div>
    </EditorRoot>
  );
}
export default function Editor() {
  return (
    <DomProvider>
      <BrowserRouter basename="_studio/editor">
        <Routes>
          <Route path="/*" element={<EditorContent />} />
        </Routes>
      </BrowserRouter>
    </DomProvider>
  );
}
