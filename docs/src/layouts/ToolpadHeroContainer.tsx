import * as React from 'react';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

export default function HeroContainer({
  sx,
  children,
}: {
  sx: SxProps;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Container
        sx={{
          minHeight: 500,
          height: 'calc(100vh - 120px)',
          maxHeight: { xs: 500, sm: 700, xl: 1000 },
          transition: '0.3s',
        }}
      >
        <Grid
          container
          alignItems="center"
          wrap="nowrap"
          sx={{ ...sx, height: '100%', mx: 'auto' }}
        >
          <Grid item md={12} lg={12} sx={{ m: 'auto' }}>
            {children}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
