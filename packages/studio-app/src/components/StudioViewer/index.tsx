import { IconButton, styled } from '@mui/material';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import * as studioDom from '../../studioDom';
import StudioAppBar from '../StudioAppBar';
import PageView from '../PageView';
import { NextLinkComposed } from '../Link';
import { NodeId } from '../../types';

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
  dom: studioDom.StudioDom;
  pageNodeId: NodeId;
}

export default function Viewer({ dom, pageNodeId }: ViewerProps) {
  return (
    <ViewerRoot>
      <StudioAppBar
        actions={
          <IconButton color="inherit" component={NextLinkComposed} to={`/_studio/editor`}>
            <EditIcon />
          </IconButton>
        }
      />
      <div className={classes.content}>
        <React.Fragment>
          <PageView dom={dom} pageNodeId={pageNodeId} />
        </React.Fragment>
      </div>
    </ViewerRoot>
  );
}
