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

Image.defaultProps = {
  alt: '',
  sx: { maxWidth: '100%' },
  width: 400,
  height: 300,
  loading: false,
  fit: 'contain',
} as ImageProps;

export default createComponent(Image, {
  loadingPropSource: ['src'],
  loadingProp: 'loading',
  argTypes: {
    src: {
      typeDef: { type: 'string' },
    },
    alt: {
      typeDef: { type: 'string' },
    },
    fit: {
      typeDef: { type: 'string', enum: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
    },
    width: {
      typeDef: { type: 'number' },
    },
    height: {
      typeDef: { type: 'number' },
    },
    loading: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
