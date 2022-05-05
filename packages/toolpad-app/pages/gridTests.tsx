import { Box, SxProps, TextField as MuiTextField } from '@mui/material';
import type { NextPage } from 'next';
import * as React from 'react';

function Image() {
  return (
    <Box
      component="img"
      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
      src="https://images.unsplash.com/photo-1583147539360-5f1db9921fb0"
    />
  );
}

function TextField() {
  return <MuiTextField fullWidth size="small" />;
}

const components = {
  textField: {
    Component: TextField,
    resizableHorizontally: true,
    resizableVertically: false,
    minHeight: 5,
    minWidth: 1,
  },
  image: {
    Component: Image,
    resizableHorizontally: true,
    resizableVertically: true,
    minHeight: 5,
    minWidth: 1,
  },
};

const elements = [
  {
    component: components.textField,
    props: {},
    columnStart: 5,
    columnEnd: 10,
    rowStart: 3,
  },
  {
    component: components.image,
    props: {},
    columnStart: 2,
    columnEnd: 9,
    rowStart: 20,
    rowEnd: 50,
  },
];

interface GridItemProps {
  children?: React.ReactNode;
  gridRow?: SxProps['gridRow'];
  gridColumn?: SxProps['gridColumn'];
}

function GridItem({ children, gridRow, gridColumn }: GridItemProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gridRow,
        gridColumn,
        position: 'relative',
      }}
    >
      {children}
    </Box>
  );
}

const GridTests: NextPage = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, [col-start] 1fr)',
        gridTemplateRows: 'repeat(auto-fill, 16px)',
        minHeight: 'calc(100vh + 50px)',
      }}
    >
      {elements.map((elm) => {
        const gridRowStart = elm.rowStart;
        const gridRowSpan = elm.rowEnd ? elm.rowEnd - elm.rowStart : elm.component.minHeight;
        const gridColumnStart = elm.columnStart;
        const gridColumnSpan = elm.columnEnd - elm.columnStart;
        return (
          <GridItem
            gridRow={`${gridRowStart} / span ${gridRowSpan}`}
            gridColumn={`${gridColumnStart} / span ${gridColumnSpan}`}
          >
            {<elm.component.Component {...elm.props} />}
          </GridItem>
        );
      })}
    </Box>
  );
};

export default GridTests;
