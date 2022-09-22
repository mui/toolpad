import { Box, Skeleton, SxProps } from '@mui/material';
import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';

export interface ImageProps {
  src: string;
  alt?: string;
  sx?: SxProps;
  width: number;
  height: number;
  loading?: boolean;
  fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const DEFAULT_IMG_SRC = 'https://mui.com/static/branding/mui-x/Mocktable-dark.png';

function Image({ sx: sxProp, src, width, height, alt, loading: loadingProp, fit }: ImageProps) {
  const sx: SxProps = React.useMemo(
    () => ({
      ...sxProp,
      width,
      height,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [sxProp, width, height],
  );

  const [imgLoading, setImgLoading] = React.useState(true);
  const handleLoad = React.useCallback(() => setImgLoading(false), []);

  const loading = loadingProp || imgLoading;

  return (
    <Box sx={sx}>
      {loading ? <Skeleton variant="rectangular" width={width} height={height} /> : null}
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          position: 'absolute',
          visibility: loading ? 'hidden' : 'visible',
        }}
        onLoad={handleLoad}
      />
    </Box>
  );
}

export default createComponent(Image, {
  layoutDirection: 'both',
  loadingPropSource: ['src'],
  loadingProp: 'loading',
  argTypes: {
    src: {
      typeDef: { type: 'string' },
      defaultValue: DEFAULT_IMG_SRC,
    },
    alt: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    fit: {
      typeDef: { type: 'string', enum: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
      defaultValue: 'contain',
    },
    width: {
      typeDef: { type: 'number' },
      defaultValue: 400,
    },
    height: {
      typeDef: { type: 'number' },
      defaultValue: 300,
    },
    loading: {
      typeDef: { type: 'boolean' },
      defaultValue: false,
    },
    sx: {
      typeDef: { type: 'object' },
      defaultValue: { maxWidth: '100%' },
    },
  },
});
