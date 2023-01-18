import * as React from 'react';
import { styled } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JsRuntimeProvider } from '@mui/toolpad-core/jsRuntime';
import DomProvider, { useDom } from '../DomLoader';
import * as appDom from '../../appDom';
import ConnectionEditor from './ConnectionEditor';
import AppEditorShell from './AppEditorShell';
import PageEditor from './PageEditor';
import CodeComponentEditor from './CodeComponentEditor';
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
}

function FileEditor({ appId }: FileEditorProps) {
  const { dom, currentView } = useDom();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);

  const location = useLocation();
  const navigate = useNavigate();

  const firstPage = pages.length > 0 ? pages[0] : null;

  React.useEffect(() => {
    if (currentView.kind === 'page') {
      const newPathname = `/app/${appId}/pages/${currentView.nodeId || firstPage?.id}`;

      if (newPathname !== location.pathname) {
        navigate(
          {
            pathname: newPathname,
          },
          {
            replace: true,
          },
        );
      }
    }

    if (currentView.kind === 'connection') {
      const newPathname = `/app/${appId}/connections/${currentView.nodeId}`;

      if (newPathname !== location.pathname) {
        navigate(
          {
            pathname: newPathname,
          },
          {
            replace: true,
          },
        );
      }
    }

    if (currentView.kind === 'codeComponent') {
      const newPathname = `/app/${appId}/codeComponents/${currentView.nodeId}`;

      if (newPathname !== location.pathname) {
        navigate(
          {
            pathname: newPathname,
          },
          {
            replace: true,
          },
        );
      }
    }
  }, [appId, currentView.kind, currentView.nodeId, firstPage?.id, location.pathname, navigate]);

  return (
    <AppEditorShell appId={appId}>
      {currentView.kind === 'page' ? (
        <PageEditor appId={appId} nodeId={currentView.nodeId || firstPage?.id} />
      ) : null}
      {currentView.kind === 'connection' ? (
        <ConnectionEditor appId={appId} nodeId={currentView.nodeId} />
      ) : null}
      {currentView.kind === 'codeComponent' ? (
        <CodeComponentEditor appId={appId} nodeId={currentView.nodeId} />
      ) : null}
      {!['page', 'connection', 'codeComponent'].includes(currentView.kind) ? (
        <NoPageFound appId={appId} />
      ) : null}
    </AppEditorShell>
  );
}

export interface EditorContentProps {
  appId: string;
}

function EditorContent({ appId }: EditorContentProps) {
  return (
    <EditorRoot>
      <FileEditor appId={appId} />
    </EditorRoot>
  );
}
export default function Editor() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  return (
    <JsRuntimeProvider>
      <DomProvider appId={appId}>
        <EditorContent appId={appId} />
      </DomProvider>
    </JsRuntimeProvider>
  );
}
