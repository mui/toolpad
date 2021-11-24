import { IconButton, styled } from '@mui/material';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { StudioPage } from '../../types';
import PageProvider from '../PageStateProvider';
import StudioAppBar from '../StudioAppBar';
import PageView from '../PageView2';
import { NextLinkComposed } from '../Link';

const classes = {
  content: 'StudioContent',
};

const ViewerRoot = styled('div')({
  height: '100vh',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [`& .${classes.content}`]: {
    flex: 1,
    overflow: 'auto',
  },
});

export interface ViewerProps {
  page: StudioPage;
}

export default function Viewer({ page }: ViewerProps) {
  return (
    <ViewerRoot>
      <StudioAppBar
        actions={
          <IconButton
            color="inherit"
            component={NextLinkComposed}
            to={`/_studio/editor/${page.id}`}
          >
            <EditIcon />
          </IconButton>
        }
      />
      <div className={classes.content}>
        <PageProvider page={page}>
          <PageView page={page} />
        </PageProvider>
      </div>
    </ViewerRoot>
  );
}
