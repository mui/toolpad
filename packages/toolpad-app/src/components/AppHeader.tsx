import * as React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Header from './Header';

export interface HeaderProps {
  appId: string;
  actions: React.ReactNode;
}

export default function AppHeader({ appId, actions }: HeaderProps) {
  return (
    <Header
      navigation={
        <React.Fragment>
          <Button component={Link} to={`/app/${appId}/editor`} color="inherit">
            Editor
          </Button>
          <Button component={Link} to={`/app/${appId}/releases`} color="inherit">
            Releases
          </Button>
        </React.Fragment>
      }
      actions={actions}
    />
  );
}
