import * as React from 'react';
import { ComponentDefinition, FlowDirection } from './index';
import { DATA_PROP_NODE_ID, DEFINITION_KEY } from './constants';

export interface SlotsWrapperProps {
  children?: React.ReactNode;
  __studioSlots: string;
  parentId: string;
  direction: FlowDirection;
}

export function SlotsWrapper({ children }: SlotsWrapperProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

export interface WrappedStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

export const WrappedStudioNode = React.forwardRef(function WrappedStudioNode(
  { children, id }: WrappedStudioNodeProps,
  ref,
) {
  const newRef = React.useCallback(
    (elm) => {
      if (elm) {
        elm.setAttribute(DATA_PROP_NODE_ID, id);
      }
      if (typeof ref === 'function') {
        ref(elm);
      } else if (ref) {
        ref.current = elm;
      }
    },
    [id, ref],
  );

  const child = React.Children.only(children);
  const definition = (child.type as any)[DEFINITION_KEY] as ComponentDefinition<any> | undefined;

  const newProps: any = {
    ref: newRef,
    __studioNodeId: id,
  };

  if (definition) {
    Object.entries(child.props).forEach(([name, value]) => {
      const propDef = definition.props[name];
      if (propDef?.type === 'slots') {
        newProps[name] = (
          <SlotsWrapper
            __studioSlots={name}
            parentId={id}
            direction={propDef.getDirection(child.props)}
          >
            {value as any}
          </SlotsWrapper>
        );
      }
    });
  }

  return React.cloneElement(child, newProps);
});
