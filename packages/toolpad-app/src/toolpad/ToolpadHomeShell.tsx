import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
} from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';
import FlexFill from '../components/FlexFill';
import { DOCUMENTATION_URL, REPOSITORY_URL } from '../constants';
import ToolpadShell, { ToolpadShellProps } from './ToolpadShell';

const NavigationListItemButton = styled(ListItemButton)({ height: 56 });

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
            overflow: 'auto',
          }}
        >
          <List>
            <ListItem disablePadding>
              {/* @ts-expect-error https://github.com/mui/material-ui/issues/29875 */}
              <NavigationListItemButton component={Link} to={'/apps'}>
                <ListItemText primary="Apps" />
              </NavigationListItemButton>
            </ListItem>
            <Divider component="li" />
          </List>
          <FlexFill />
          <List>
            <ListItem disablePadding>
              {/* @ts-expect-error https://github.com/mui/material-ui/issues/29875 */}
              <NavigationListItemButton component="a" href={DOCUMENTATION_URL} target="_blank">
                <ListItemText primary="Documentation" />
              </NavigationListItemButton>
            </ListItem>
            <Divider component="li" />
            <ListItem disablePadding>
              {/* @ts-expect-error https://github.com/mui/material-ui/issues/29875 */}
              <NavigationListItemButton component="a" href={REPOSITORY_URL} target="_blank">
                <ListItemText primary="GitHub" />
              </NavigationListItemButton>
            </ListItem>
          </List>
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ flex: 1, height: '100%' }}>{children}</Box>
      </Stack>
    </ToolpadShell>
  );
}
