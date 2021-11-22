import * as React from 'react';
import { List, ListItem } from '@mui/material';
import { StudioComponentDefinition } from '../../types';
import componentDefinitions from '../../studioComponents';
import { useEditorApi } from './EditorProvider';

function getDefaultProps(definition: StudioComponentDefinition): Record<string, any> {
  return Object.fromEntries(
    Object.entries(definition.props).flatMap(([name, prop]) =>
      prop.defaultValue !== undefined ? [[name, prop.defaultValue]] : [],
    ),
  );
}

export interface ComponentCatalogProps {
  className?: string;
}

export default function ComponentCatalog({ className }: ComponentCatalogProps) {
  const api = useEditorApi();

  const handleDragStart =
    (id: string, definition: StudioComponentDefinition) =>
    (event: React.DragEvent<HTMLLIElement>) => {
      event.dataTransfer.dropEffect = 'copy';
      api.addComponentDragStart(id, getDefaultProps(definition));
    };

  return (
    <List className={className}>
      {Object.entries(componentDefinitions).map(([id, definition]) => {
        if (!definition) {return null;}
        return (
          <ListItem key={id} draggable onDragStart={handleDragStart(id, definition)}>
            {id}
          </ListItem>
        );
      })}
    </List>
  );
}
