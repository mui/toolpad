import * as React from 'react';
import { ComponentDefinition, FlowDirection } from './index';
import { DEFINITION_KEY } from './constants';

export interface SlotsWrapperProps {
  children?: React.ReactNode;
  __studioSlots: string;
  parentId: string;
  direction: FlowDirection;
}

export function SlotsWrapper({ children }: SlotsWrapperProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

export interface PlaceHolderProps {
  __studioSlots: string;
  parentId: string;
}

// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PlaceHolder(props: PlaceHolderProps) {
  return (
    <div
      style={{
        display: 'block',
        minHeight: 40,
        minWidth: 200,
      }}
    />
  );
}

export interface WrappedStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

export const WrappedStudioNode = React.forwardRef(function WrappedStudioNode(
  { children, id }: WrappedStudioNodeProps,
  ref,
) {
  const child = React.Children.only(children);
  const definition = (child.type as any)[DEFINITION_KEY] as ComponentDefinition<any> | undefined;

  const newProps: any = {
    ref,
    __studioNodeId: id,
  };

  if (definition) {
    Object.entries(child.props).forEach(([name, value]) => {
      const propDef = definition.props[name];
      if (propDef?.type === 'slots') {
        const valueAsArray = React.Children.toArray(value as any);
        newProps[name] =
          valueAsArray.length > 0 ? (
            <SlotsWrapper
              __studioSlots={name}
              parentId={id}
              direction={propDef.getDirection(child.props)}
            >
              {valueAsArray}
            </SlotsWrapper>
          ) : (
            <PlaceHolder __studioSlots={name} parentId={id} />
          );
      } else if (propDef?.type === 'slot') {
        const valueAsArray = React.Children.toArray(value as any);
        if (valueAsArray.length <= 0) {
          newProps[name] = <PlaceHolder __studioSlots={name} parentId={id} />;
        }
      }
    });
  }

  return React.cloneElement(child, newProps);
});
