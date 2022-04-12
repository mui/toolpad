import { Box, SxProps, Theme } from '@mui/material';
import * as React from 'react';

export interface ImageProps {
  src: string;
  alt?: string;
  sx?: SxProps<Theme>;
}

const EMPTY_SRC_STYLES = { minWidth: 30, minHeight: 30, border: 'inset' };

export default function Image({ sx, src, ...props }: ImageProps) {
  return <Box component="img" src={src} sx={src ? sx : EMPTY_SRC_STYLES} {...props} />;
}

Image.defaultProps = {
  alt: '',
  sx: { maxWidth: '100%' },
};
