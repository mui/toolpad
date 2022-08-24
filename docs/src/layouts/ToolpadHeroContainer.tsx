import * as React from 'react';
import { SxProps } from '@mui/material/styles';
import Container from '@mui/material/Container';

export default function HeroContainer({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx: SxProps;
}) {
  return (
    <Container
      sx={{
        minHeight: 500,
        maxHeight: { xs: 800, sm: 1000, md: 1200, lg: 1400 },
        transition: '0.3s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
