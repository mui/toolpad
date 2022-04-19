import { Box, Typography } from '@mui/material';
import * as React from 'react';
import DerivedStateEditor from './DerivedStateEditor';
import QueryStateEditor from './QueryStateEditor';
import UrlQueryEditor from './UrlQueryEditor';

// TODO: remove deprecated state
const DEPRECATED = false;

export default function NonRenderedPageContent() {
  return (
    <Box>
      <Typography variant="subtitle1">Page State:</Typography>
      <UrlQueryEditor />
      {DEPRECATED && <DerivedStateEditor />}
      <QueryStateEditor />
    </Box>
  );
}
