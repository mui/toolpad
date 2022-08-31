import * as React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ToolpadShell from './ToolpadShell';

export interface ToolpadAppShellProps {
  appId: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ToolpadAppShell({ appId, ...props }: ToolpadAppShellProps) {
  return (
    <ToolpadShell
      navigation={
        <React.Fragment>
          <Button component={Link} to={`/app/${appId}/editor`} color="inherit">
            Editor
          </Button>
          <Button component={Link} to={`/app/${appId}/releases`} color="inherit">
            Releases
          </Button>
          <Button component={Link} to={`/app/${appId}/deployments`} color="inherit">
            Deployments
          </Button>
        </React.Fragment>
      }
      {...props}
    />
  );
}
