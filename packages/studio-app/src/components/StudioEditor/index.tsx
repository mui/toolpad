import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { CircularProgress, IconButton } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudioAppBar from '../StudioAppBar';
import PageEditor from './PageFileEditor';
import PagePanel from './PagePanel';
import client from '../../api';
import DomProvider, { useDom, useDomState } from '../DomProvider';
import ApiEditor from './ApiFileEditor';
import CodeComponentEditor from './CodeComponentEditor';

const classes = {
  content: 'StudioContent',
  hierarchyPanel: 'StudioHierarchyPanel',
  editorPanel: 'StudioEditorPanel',
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
  [`& .${classes.hierarchyPanel}`]: {
    width: 250,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.editorPanel}`]: {
    flex: 1,
  },
}));

interface FileEditorProps {
  className?: string;
}

function FileEditor({ className }: FileEditorProps) {
  const domState = useDomState();
  return domState.loaded ? (
    <Routes>
      <Route path="pages/:nodeId" element={<PageEditor className={className} />} />
      <Route path="apis/:nodeId" element={<ApiEditor className={className} />} />
      <Route
        path="codeComponents/:nodeId"
        element={<CodeComponentEditor className={className} />}
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
        <PagePanel className={classes.hierarchyPanel} />
        <FileEditor className={classes.editorPanel} />
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
