import * as React from 'react';
import { List, ListItem } from '@mui/material';
import { ComponentDefinition, ArgTypeDefinitions } from '@mui/studio-core';
import { DEFAULT_COMPONENTS, getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { useEditorApi } from '../EditorProvider';
import { StudioNodeProps } from '../../../types';
import { ExactEntriesOf } from '../../../utils/types';
import { useDom } from '../../DomProvider';

function getDefaultPropValues<P = {}>(
  definition: ComponentDefinition<P>,
): Partial<StudioNodeProps<P>> {
  const result: Partial<StudioNodeProps<P>> = {};
  const entries = Object.entries(definition.argTypes) as ExactEntriesOf<ArgTypeDefinitions<P>>;
  entries.forEach(([name, prop]) => {
    if (prop) {
      result[name] = {
        type: 'const',
        value: prop.defaultValue,
      };
    }
  });

  return result;
}

export interface ComponentCatalogProps {
  className?: string;
}

export default function ComponentCatalog({ className }: ComponentCatalogProps) {
  const api = useEditorApi();
  const dom = useDom();

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLLIElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    const componentDef = getStudioComponent(dom, componentType);
    const newNode = studioDom.createElement(dom, componentType, getDefaultPropValues(componentDef));
    api.deselect();
    api.pageEditor.newNodeDragStart(newNode);
  };

  return (
    <List className={className}>
      {Array.from(DEFAULT_COMPONENTS.keys(), (componentType) => {
        return (
          <ListItem key={componentType} draggable onDragStart={handleDragStart(componentType)}>
            {componentType}
          </ListItem>
        );
      })}
    </List>
  );
}
