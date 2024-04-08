import { styled } from '@mui/material';
import {
  PanelResizeHandle as PanelResizeHandleOrig,
  PanelResizeHandleProps,
} from 'react-resizable-panels';

export * from 'react-resizable-panels';

const RESIZE_HANDLE_OFFSET = 3;

export const PanelResizeHandle: React.FC<PanelResizeHandleProps> = styled(PanelResizeHandleOrig)(
  ({ theme }) => ({
    backgroundClip: 'padding-box',
    zIndex: 1,
    display: 'flex',
    backgroundColor: theme.palette.divider,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0)',
    '&:hover': {
      borderColor: theme.palette.divider,
    },
    transition: 'all 250ms ease',
    '&[data-panel-group-direction="horizontal"]': {
      width: 2 * RESIZE_HANDLE_OFFSET + 1,
      marginLeft: -RESIZE_HANDLE_OFFSET,
      marginRight: -RESIZE_HANDLE_OFFSET,
      borderLeftWidth: RESIZE_HANDLE_OFFSET,
      borderRightWidth: RESIZE_HANDLE_OFFSET,
    },
    '&[data-panel-group-direction="vertical"]': {
      height: 2 * RESIZE_HANDLE_OFFSET + 1,
      marginTop: -RESIZE_HANDLE_OFFSET,
      marginBottom: -RESIZE_HANDLE_OFFSET,
      borderTopWidth: RESIZE_HANDLE_OFFSET,
      borderBottomWidth: RESIZE_HANDLE_OFFSET,
    },
  }),
);
