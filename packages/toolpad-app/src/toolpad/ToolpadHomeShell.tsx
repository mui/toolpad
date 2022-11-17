import { Box, Divider, List, ListItem, ListItemButton, ListItemText, Stack } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';
import FlexFill from '../components/FlexFill';
import { DOCUMENTATION_URL, REPOSITORY_URL } from '../constants';
import ToolpadShell, { ToolpadShellProps } from './ToolpadShell';

export interface HomeShellProps extends ToolpadShellProps {}

export default function HomeShell({ children, ...props }: HomeShellProps) {
  return (
    <ToolpadShell {...props}>
      <Stack direction="row" sx={{ height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: 250,
            mt: 3,
            ml: 2,
            overflow: 'auto',
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton sx={{ height: 56 }} component={Link} to={'/apps'}>
                <ListItemText primary="Apps" />
              </ListItemButton>
            </ListItem>
            <Divider component="li" />
          </List>
          <FlexFill />
          <List>
            <ListItem disablePadding>
              <ListItemButton sx={{ height: 56 }} component="a" href={DOCUMENTATION_URL}>
                <ListItemText primary="Documentation" />
              </ListItemButton>
            </ListItem>
            <Divider component="li" />
            <ListItem disablePadding>
              <ListItemButton sx={{ height: 56 }} component="a" href={REPOSITORY_URL}>
                <ListItemText primary="GitHub" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ flex: 1, height: '100%' }}>{children}</Box>
      </Stack>
    </ToolpadShell>
  );
}
