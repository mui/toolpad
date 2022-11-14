import * as React from 'react';
import { styled } from '@mui/material';
import Header from './Header';

import DemoBar from './DemoBar';

import config from '../../config';

export interface ToolpadShellProps {
  actions?: React.ReactNode;
  status?: React.ReactNode;
  children?: React.ReactNode;
}

const ToolpadShellRoot = styled('div')({
  width: '100vw',
  maxWidth: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const ViewPort = styled('div')({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
});

export default function ToolpadShell({ children, ...props }: ToolpadShellProps) {
  return (
    <ToolpadShellRoot>
      <Header {...props} />
      <ViewPort>{children}</ViewPort>
      {config.isDemo ? <DemoBar /> : null}
    </ToolpadShellRoot>
  );
}
