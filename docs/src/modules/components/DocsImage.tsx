import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const Root = styled('div')({
  position: 'relative',
});

interface DocsImageProps {
  src: string;
  alt: string;
  caption?: string;
  zoom?: boolean;
  indent?: number;
}

interface ImageViewerProps {
  open: boolean;
  src: string;
  alt: string;
  handleClose: () => void;
}

const Img = styled('img')<DocsImageProps>(({ theme, zoom, indent }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: '-webkit-fill-available',
  display: 'block',
  position: 'relative',
  marginTop: theme.spacing(3),
  marginLeft: indent ? theme.spacing(5 * indent) : 'auto',
  marginBottom: 0,
  marginRight: indent ? 0 : 'auto',
  zIndex: 5,
  borderRadius: 4,
  maxWidth: zoom === false ? 'min(50vw, 500px)' : 'unset',
  cursor: zoom ? 'zoom-in' : 'initial',
}));

const ImageCaption = styled('p')<Pick<DocsImageProps, 'indent'>>(({ theme, indent }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontFamily: theme.typography.fontFamily,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  marginLeft: indent ? theme.spacing(5 * indent) : 'auto',
  color:
    theme.palette.mode === 'dark' ? alpha(theme.palette.grey[500], 0.8) : theme.palette.grey[700],
  '& a': {
    color: 'inherit',
    textDecoration: 'underline',
  },
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
  const { src, alt, caption, zoom = true, indent = 0 } = props;
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
        <Img src={src} alt={alt} zoom={zoom} indent={indent} onClick={handleClick} />
        <ImageCaption indent={indent}>{caption}</ImageCaption>
      </Root>
      <ImageViewer open={open} src={src} alt={alt} handleClose={handleViewerClose} />
    </React.Fragment>
  );
}
