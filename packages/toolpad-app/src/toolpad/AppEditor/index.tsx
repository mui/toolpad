import * as React from 'react';
import { styled } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JsRuntimeProvider } from '@mui/toolpad-core/jsServerRuntime';
import PageEditor from './PageEditor';
import DomProvider, { useDom } from '../AppState';
import ConnectionEditor from './ConnectionEditor';
import AppEditorShell from './AppEditorShell';
import CodeComponentEditor from './CodeComponentEditor';
import NoPageFound from './NoPageFound';
import { getPathnameFromView } from '../../utils/domView';

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
  const { currentView } = useDom();

  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const newPathname = getPathnameFromView(appId, currentView);
    if (newPathname !== location.pathname) {
      navigate({ pathname: newPathname }, { replace: true });
    }
  }, [appId, currentView, location.pathname, navigate]);

  const currentViewContent = React.useMemo(() => {
    switch (currentView.kind) {
      case 'page':
        return <PageEditor appId={appId} nodeId={currentView.nodeId} />;
      case 'connection':
        return <ConnectionEditor appId={appId} nodeId={currentView.nodeId} />;
      case 'codeComponent':
        return <CodeComponentEditor appId={appId} nodeId={currentView.nodeId} />;
      default:
        return <NoPageFound appId={appId} />;
    }
  }, [appId, currentView.kind, currentView.nodeId]);

  return <AppEditorShell appId={appId}>{currentViewContent}</AppEditorShell>;
}

export interface EditorContentProps {
  appId: string;
}

export function EditorContent({ appId }: EditorContentProps) {
  return (
    <JsRuntimeProvider>
      <DomProvider appId={appId}>
        <EditorRoot>
          <FileEditor appId={appId} />
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

  return <EditorContent appId={appId} />;
}
