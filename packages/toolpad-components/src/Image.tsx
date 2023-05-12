import { Box, Skeleton, SxProps } from '@mui/material';
import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants.js';

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
    <Box sx={{ maxWidth: '100%', ...sx }}>
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
  helperText: 'The Image component lets you display images.',
  layoutDirection: 'both',
  loadingPropSource: ['src'],
  loadingProp: 'loading',
  argTypes: {
    src: {
      helperText: 'The url of the image. Must resolve to an image file.',
      type: 'string',
    },
    alt: {
      helperText:
        "The `alt` attribute holds a text description of the image. screen readers read this description out to their users so they know what the image means. Alt text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or linkrot.",
      type: 'string',
      default: '',
    },
    fit: {
      helperText:
        'Defines how the image should [resize](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) to its container.',
      type: 'string',
      enum: ['contain', 'cover', 'fill', 'none', 'scale-down'],
      default: 'contain',
    },
    width: {
      helperText: 'The image width in pixels',
      type: 'number',
      default: 400,
    },
    height: {
      type: 'number',
      default: 300,
    },
    loading: {
      helperText: 'Displays a loading animation indicating the image is still loading',
      type: 'boolean',
      default: false,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
