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
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        rowGap: 3,
        columnGap: 0,
        justifyContent: 'space-between',
        py: { xs: 4, sm: 8 },
        minHeight: '600px',
        transition: '0.3s',
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
