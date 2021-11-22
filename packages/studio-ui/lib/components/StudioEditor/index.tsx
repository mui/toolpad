import { styled } from '@mui/system';
import * as React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { IconButton } from '@mui/material';
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

  const handleSave = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${state.page.id}`, {
        method: 'PUT',
        body: JSON.stringify(state.page),
        headers: {
          'content-type': 'application/json',
        },
      });

      if (res.ok) {
        router.push(`/${state.page.id}`);
      } else {
        alert(`HTTP error ${res.status}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }, [router, state.page]);

  return (
    <PageProvider page={state.page}>
      <StudioAppBar
        actions={
          <IconButton color="inherit" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        }
      />
      <div className={classes.content}>
        <PagePanel className={classes.pagePanel} />
        <StudioViewEditor className={classes.renderPanel} />
        <ComponentPanel className={classes.componentPanel} />
      </div>
      <BindingEditor />
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
