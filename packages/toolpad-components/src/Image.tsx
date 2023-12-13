import { Box, Skeleton, SxProps, styled } from '@mui/material';
import * as React from 'react';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';
import ErrorOverlay from './components/ErrorOverlay';

export interface ImageProps {
  src: string;
  alt?: string;
  sx?: SxProps;
  width: number;
  height: number;
  loading?: boolean;
  error?: string;
  fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const Img = styled('img')({
  width: '100%',
  height: '100%',
  position: 'absolute',
});

function Image({
  sx: sxProp,
  src,
  width,
  height,
  alt,
  loading: loadingProp,
  error: errorProp,
  fit,
}: ImageProps) {
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

  const [imgError, setImgError] = React.useState<Error | null>(null);
  const [imgLoading, setImgLoading] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setImgLoading(false);
  }, []);

  const handleError = React.useCallback(() => {
    setImgError(new Error(`Failed to load image "${src}"`));
    setImgLoading(false);
  }, [src]);

  React.useEffect(() => {
    setImgLoading(true);
    setImgError(null);
  }, [src]);

  const loading = loadingProp || imgLoading;
  const error = errorProp || imgError;
  return (
    <Box sx={{ maxWidth: '100%', position: 'relative', ...sx }}>
      {error ? <ErrorOverlay error={error} /> : null}
      {loading && !error ? <Skeleton variant="rectangular" width={width} height={height} /> : null}
      <Img
        src={src}
        alt={alt}
        sx={{
          objectFit: fit,
          visibility: loading || error ? 'hidden' : 'visible',
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </Box>
  );
}

export default createBuiltin(Image, {
  helperText: 'The Image component lets you display images.',
  layoutDirection: 'both',
  loadingPropSource: ['src'],
  loadingProp: 'loading',
  errorProp: 'error',
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
      helperText: 'The image height in pixels',
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
