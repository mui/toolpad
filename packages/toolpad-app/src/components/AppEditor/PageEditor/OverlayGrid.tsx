import * as React from 'react';
import { Grid, styled } from '@mui/material';

const GRID_NUMBER_OF_COLUMNS = 12;

const StyledGrid = styled(Grid)({
  height: '100vh',
  pointerEvents: 'none',
  position: 'absolute',
  width: '100vw',
  zIndex: 1,
  margin: '0 auto',
  left: -4,
});

const StyledGridColumn = styled('div')({
  backgroundColor: 'pink',
  height: '100%',
  opacity: 0.2,
  width: '100%',
});

export function OverlayGrid() {
  return (
    <StyledGrid container columnSpacing={1}>
      {[...Array(GRID_NUMBER_OF_COLUMNS)].map((column, index) => (
        <Grid key={index} item xs={1}>
          <StyledGridColumn />
        </Grid>
      ))}
    </StyledGrid>
  );
}
