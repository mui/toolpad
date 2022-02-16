import { styled } from '@mui/system';
import * as React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudioAppBar from '../StudioAppBar';
import PageEditor from './PageEditor';
import PagePanel from './PagePanel';
import DomProvider, { useDomLoader } from '../DomLoader';
import ApiEditor from './ApiEditor';
import CodeComponentEditor from './CodeComponentEditor';
import ConnectionEditor from './ConnectionEditor';

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
    overflow: 'hidden',
  },
}));

interface FileEditorProps {
  className?: string;
}

function FileEditor({ className }: FileEditorProps) {
  return (
    <Routes>
      <Route path="connections/:nodeId" element={<ConnectionEditor className={className} />} />
      <Route path="apis/:nodeId" element={<ApiEditor className={className} />} />
      <Route path="pages/:nodeId" element={<PageEditor className={className} />} />
      <Route
        path="codeComponents/:nodeId"
        element={<CodeComponentEditor className={className} />}
      />
    </Routes>
  );
}

function EditorContent() {
  const domLoader = useDomLoader();

  return (
    <EditorRoot>
      <StudioAppBar
        actions={
          <React.Fragment>
            {domLoader.saving ? (
              <Box display="flex" flexDirection="row" alignItems="center">
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              </Box>
            ) : null}
            <Typography>{domLoader.unsavedChanges} unsaved change(s).</Typography>
          </React.Fragment>
        }
      />
      {domLoader.dom ? (
        <div className={classes.content}>
          <PagePanel className={classes.hierarchyPanel} />
          <FileEditor className={classes.editorPanel} />
        </div>
      ) : (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
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
