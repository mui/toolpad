import * as React from 'react';
import { styled } from '@mui/material';
import { Route, Routes, useParams, Navigate, useNavigate } from 'react-router-dom';
import { JsRuntimeProvider } from '@mui/toolpad-core/jsRuntime';
import PageEditor from './PageEditor';
import DomProvider, { useDom } from '../DomLoader';
import * as appDom from '../../appDom';
import CodeComponentEditor from './CodeComponentEditor';
import ConnectionEditor from './ConnectionEditor';
import AppEditorShell from './AppEditorShell';
import NoPageFound from './NoPageFound';

const classes = {
  content: 'Toolpad_Content',
  hierarchyPanel: 'Toolpad_HierarchyPanel',
  editorPanel: 'Toolpad_EditorPanel',
};

const EditorRoot = styled('div')(({ theme }) => ({
  height: 1,
  minHeight: '100vh',
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
  appId: string;
  prefix: string;
}

function FileEditor({ appId, prefix }: FileEditorProps) {
  const { dom, currentView } = useDom();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);

  const navigate = useNavigate();

  const firstPage = pages.length > 0 ? pages[0] : null;

  React.useEffect(() => {
    switch (currentView.kind) {
      case 'page':
        navigate(`${prefix}/pages/${currentView.nodeId || firstPage?.id}`, { replace: true });
        break;
      case 'connection':
        navigate(`${prefix}/connections/${currentView.nodeId}`, { replace: true });
        break;
      case 'codeComponent':
        navigate(`${prefix}/codeComponents/${currentView.nodeId}`);
        break;
      default:
    }
  }, [currentView.kind, currentView.nodeId, firstPage?.id, navigate, prefix]);

  return (
    <Routes>
      <Route element={<AppEditorShell appId={appId} />}>
        <Route path="connections/:nodeId" element={<ConnectionEditor appId={appId} />} />
        <Route path="pages/:nodeId" element={<PageEditor appId={appId} />} />
        <Route path="codeComponents/:nodeId" element={<CodeComponentEditor appId={appId} />} />
        <Route
          index
          element={
            firstPage ? (
              <Navigate to={`pages/${firstPage.id}`} replace />
            ) : (
              <NoPageFound appId={appId} />
            )
          }
        />
      </Route>
    </Routes>
  );
}

export interface EditorContentProps {
  appId: string;
  prefix: string;
}

export function EditorContent({ appId, prefix }: EditorContentProps) {
  return (
    <JsRuntimeProvider>
      <DomProvider appId={appId}>
        <EditorRoot>
          <FileEditor appId={appId} prefix={prefix} />
        </EditorRoot>
      </DomProvider>
    </JsRuntimeProvider>
  );
}

export default function Editor() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  return <EditorContent appId={appId} prefix={`/app/${appId}`} />;
}
