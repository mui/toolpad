import * as React from 'react';
import { styled, Typography } from '@mui/material';
import { useStudioComponents } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { useDom } from '../../DomLoader';
import { usePageEditorApi } from './PageEditorProvider';

const ComponentCatalogRoot = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
});

const ComponentCatalogItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '1',
  margin: theme.spacing(1),
  width: '40%',
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

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    const newNode = studioDom.createElement(dom, componentType, {});
    api.deselect();
    api.newNodeDragStart(newNode);
  };

  const studioComponents = useStudioComponents(dom);

  return (
    <ComponentCatalogRoot className={className}>
      <Typography>Drag components on the canvas:</Typography>
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
    </ComponentCatalogRoot>
  );
}
