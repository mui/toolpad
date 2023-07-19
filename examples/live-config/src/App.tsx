import * as React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { MyGrid } from '../toolpad/.generated/components';

const ROWS = [
  { id: 1, a: 123, b: 'foo' },
  { id: 2, a: 234, b: 'bar' },
];

export default function App() {
  return (
    <Container>
      <Typography variant="h5">Live Config</Typography>
      <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
        <MyGrid rows={ROWS} />
      </Box>
    </Container>
  );
}
