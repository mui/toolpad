import * as React from 'react';
import { Box, Collapse, styled, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useStudioComponents } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { useDom } from '../../DomLoader';
import { usePageEditorApi } from './PageEditorProvider';

const WIDTH_COLLAPSED = 50;

const ComponentCatalogRoot = styled('div')({
  position: 'relative',
  width: WIDTH_COLLAPSED,
  height: '100%',
  zIndex: 1,
  overflow: 'visible',
});

const ComponentCatalogItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '1',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'grab',
  '&:hover': {
    background: theme.palette.action.hover,
  },
}));

export interface ComponentCatalogProps {
  className?: string;
}

export default function ComponentCatalog({ className }: ComponentCatalogProps) {
  const api = usePageEditorApi();
  const dom = useDom();

  const [open, setOpen] = React.useState(false);

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    const newNode = studioDom.createElement(dom, componentType, {});
    api.deselect();
    api.newNodeDragStart(newNode);
    setTimeout(() => setOpen(false), 0);
  };

  const studioComponents = useStudioComponents(dom);

  const handleMouseEnter = React.useCallback(() => setOpen(true), []);
  const handleMouseLeave = React.useCallback(() => setOpen(false), []);

  return (
    <ComponentCatalogRoot
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        height="100%"
        display="flex"
        flexDirection="row"
        position="fixed"
        sx={{ background: 'white', borderRight: 1, borderColor: 'divider' }}
      >
        <Collapse in={open} orientation="horizontal" timeout={200} sx={{ height: '100%' }}>
          <Box width={300} height="100%" overflow="auto">
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} padding={3}>
              {studioComponents.map((componentType) => {
                return (
                  <ComponentCatalogItem
                    key={componentType.id}
                    draggable
                    onDragStart={handleDragStart(componentType.id)}
                  >
                    {componentType.displayName}
                  </ComponentCatalogItem>
                );
              })}
            </Box>
          </Box>
        </Collapse>
        <Box display="flex" flexDirection="column" alignItems="center" width={WIDTH_COLLAPSED}>
          <Box mt={2}>{open ? <ChevronLeftIcon /> : <ChevronRightIcon />}</Box>
          <Box position="relative">
            <Typography
              sx={{
                position: 'absolute',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                transform: 'rotate(90deg) translate(-10px, 0)',
                transformOrigin: '0 50%',
              }}
            >
              Components
            </Typography>
          </Box>
        </Box>
      </Box>
    </ComponentCatalogRoot>
  );
}
