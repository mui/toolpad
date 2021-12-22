import * as React from 'react';
import { List, ListItem } from '@mui/material';
import { components } from '../../studioComponents';
import { useEditorApi } from './EditorProvider';

export interface ComponentCatalogProps {
  className?: string;
}

export default function ComponentCatalog({ className }: ComponentCatalogProps) {
  const api = useEditorApi();

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLLIElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    api.addComponentDragStart(componentType);
  };

  return (
    <List className={className}>
      {Array.from(components.keys(), (componentType) => {
        return (
          <ListItem key={componentType} draggable onDragStart={handleDragStart(componentType)}>
            {componentType}
          </ListItem>
        );
      })}
    </List>
  );
}
