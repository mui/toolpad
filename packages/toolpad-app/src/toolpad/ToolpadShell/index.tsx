import * as React from 'react';
import { Stack, styled } from '@mui/material';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';
import { GLOBAL_FUNCTIONS_FEATURE_FLAG } from '../../constants';

export interface ToolpadShellProps {
  actions?: React.ReactNode;
  status?: React.ReactNode;
  children?: React.ReactNode;
}

const ToolpadShellRoot = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const ViewPort = styled('div')({
  flex: 1,
  width: '100%',
  overflow: 'auto',
  position: 'relative',
});

export default function ToolpadShell({ children, ...props }: ToolpadShellProps) {
  return (
    <ToolpadShellRoot>
      <Header {...props} />
      <Stack direction="row" sx={{ flex: 1 }}>
        {GLOBAL_FUNCTIONS_FEATURE_FLAG ? <NavigationSidebar /> : null}
        <ViewPort>{children}</ViewPort>
      </Stack>
    </ToolpadShellRoot>
  );
}
