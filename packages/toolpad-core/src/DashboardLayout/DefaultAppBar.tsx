import * as React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';

import { Account } from '../Account';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SearchBar } from './SearchBar';
import { AppTitle } from './AppTitle';

export function DefaultAppBar(props: { menuIcon: React.ReactElement }) {
  return (
    <AppBar
      color="inherit"
      position="absolute"
      sx={{ displayPrint: 'none', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexWrap: 'wrap', width: '100%' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {props.menuIcon}
            <AppTitle />
          </Stack>
          <SearchBar onSearch={() => {}} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <ThemeSwitcher />
            <Account />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
