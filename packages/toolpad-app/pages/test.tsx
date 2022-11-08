import type { NextPage } from 'next';
import * as React from 'react';
import { Stack } from '@mui/material';
import MuiObjectInspector from '../src/components/MuiObjectInspector';

import movies from '../public/static/movies.json';

const Index: NextPage = () => (
  <Stack gap={4} m={4}>
    <MuiObjectInspector data={movies} />
    <MuiObjectInspector data={1} />
    <MuiObjectInspector data={'hello'} />
    <MuiObjectInspector data={undefined} />
  </Stack>
);
export default Index;
