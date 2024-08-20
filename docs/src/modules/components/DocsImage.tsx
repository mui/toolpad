import * as React from 'react';
import { styled, alpha, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const Root = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

interface DocsImageProps {
  src: string;
  srcDark?: string;
  alt: string;
  caption?: string;
  zoom?: boolean;
  width?: number;
  indent?: number;
  aspectRatio?: number;
}

interface ImageViewerProps {
  open: boolean;
  src: string;
  alt: string;
  handleClose: () => void;
}

const Img = styled('img')<DocsImageProps>(({ theme, zoom, indent, width, aspectRatio }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: width ?? '-webkit-fill-available',
  display: 'block',
  position: 'relative',
  aspectRatio: (aspectRatio ?? zoom === false) ? 'unset' : '1.80904522613', // 1440 / 796
  marginTop: theme.spacing(3),
  marginLeft: indent ? theme.spacing(5 * indent) : undefined,
  marginBottom: 0,
  marginRight: indent ? 0 : undefined,
  zIndex: 5,
  borderRadius: 4,
  maxWidth: zoom === false ? 'min(50vw, 500px)' : '100%',
  cursor: zoom ? 'zoom-in' : 'initial',
  '&:hover': {
    '& ~ div': {
      opacity: 1,
    },
  },
}));

const ImageCaption = styled('p')<Pick<DocsImageProps, 'indent'>>(({ theme, indent }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontFamily: theme.typography.fontFamily,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  marginLeft: indent ? theme.spacing(5 * indent) : undefined,
  color:
    theme.palette.mode === 'dark' ? alpha(theme.palette.grey[500], 0.8) : theme.palette.grey[700],
  '& a': {
    color: 'inherit',
    textDecoration: 'underline',
  },
}));

const ImageExpand = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  width: theme.typography.pxToRem(32),
  height: theme.typography.pxToRem(32),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.5)',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,0.7)',
  },
  opacity: 0,
  zIndex: 10,
}));

function ImageViewer({ open, src, alt, handleClose }: ImageViewerProps) {
  return (
    <Dialog
      open={open}
      sx={{
        backdropFilter: 'blur(2px)',
      }}
      onClose={handleClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          overflow: 'hidden',
          borderRadius: 0,
        },
      }}
    >
      <DialogContent sx={{ padding: 0, display: 'contents' }}>
        <img src={src} alt={alt} style={{ width: '100%' }} />
      </DialogContent>
    </Dialog>
  );
}

export default function DocsImage(props: DocsImageProps) {
  const { src, srcDark, alt, caption, zoom = true, indent = 0, width, aspectRatio } = props;
  const theme = useTheme();
  const computedSrc = theme?.palette?.mode === 'dark' && srcDark ? srcDark : src;
  const [open, setOpen] = React.useState(false);

  const handleClick = React.useCallback(() => {
    if (!zoom) {
      return;
    }
    setOpen(true);
  }, [zoom]);

  const handleViewerClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <React.Fragment>
      <Root>
        <Img
          src={computedSrc}
          alt={alt}
          zoom={zoom}
          indent={indent}
          onClick={handleClick}
          aspectRatio={aspectRatio}
          width={width}
        />
        {zoom ? (
          <ImageExpand onClick={handleClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" x2="14" y1="3" y2="10" />
              <line x1="3" x2="10" y1="21" y2="14" />
            </svg>
          </ImageExpand>
        ) : null}
        <ImageCaption indent={indent}>{caption}</ImageCaption>
      </Root>
      <ImageViewer open={open} src={computedSrc} alt={alt} handleClose={handleViewerClose} />
    </React.Fragment>
  );
}
