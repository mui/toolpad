import * as React from 'react';
import { styled, Typography } from '@mui/material';
import { ComponentDefinition, ArgTypeDefinitions } from '@mui/studio-core';
import { getStudioComponent, getStudioComponents } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { useEditorApi } from '../EditorProvider';
import { StudioNodeProps } from '../../../types';
import { ExactEntriesOf } from '../../../utils/types';
import { useDom } from '../../DomProvider';

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

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    const componentDef = getStudioComponent(dom, componentType);
    const newNode = studioDom.createElement(dom, componentType, getDefaultPropValues(componentDef));
    api.deselect();
    api.pageEditor.newNodeDragStart(newNode);
  };

  return (
    <ComponentCatalogRoot className={className}>
      <Typography>Drag components on the canvas:</Typography>
      {getStudioComponents(dom).map((componentType) => {
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
