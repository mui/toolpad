import * as React from 'react';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import {
  DEFINITION_KEY,
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  RUNTIME_PROP_STUDIO_SLOTS_TYPE,
} from './constants.js';
import type { ComponentDefinition, SlotType } from './index';
import { createComponent } from './index';

// NOTE: These props aren't used, they are only there to transfer information from the
// React elements to the fibers.
interface SlotsWrapperProps {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: SlotType;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

function SlotsWrapper({ children }: SlotsWrapperProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

interface PlaceHolderProps {
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlaceHolder(props: PlaceHolderProps) {
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

interface WrappedStudioNodeInternalProps {
  children: React.ReactElement;
  [RUNTIME_PROP_NODE_ID]: string;
}

// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect elements of this type
// We will wrap any slot/slots props with elements that have a [RUNTIME_PROP_STUDIO_SLOTS] so
// that we can detect these as well in the fibers.
function WrappedStudioNodeInternal({
  children,
  [RUNTIME_PROP_NODE_ID]: studioNodeId,
}: WrappedStudioNodeInternalProps) {
  const child = React.Children.only(children);
  const definition = (child.type as any)[DEFINITION_KEY] as ComponentDefinition<any> | undefined;

  let newProps: { [key: string]: unknown } | undefined;

  Object.entries(definition?.props || {}).forEach(([propName, propDef]) => {
    const value = child.props[propName];
    if (propDef?.type === 'slots') {
      const valueAsArray = React.Children.toArray(value);
      newProps = newProps ?? {};
      newProps[propName] =
        valueAsArray.length > 0 ? (
          <SlotsWrapper
            {...{
              [RUNTIME_PROP_STUDIO_SLOTS]: propName,
              [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'multiple',
            }}
            parentId={studioNodeId}
          >
            {valueAsArray}
          </SlotsWrapper>
        ) : (
          <PlaceHolder
            {...{
              [RUNTIME_PROP_STUDIO_SLOTS]: propName,
              [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'single',
            }}
            parentId={studioNodeId}
          />
        );
    } else if (propDef?.type === 'slot') {
      const valueAsArray = React.Children.toArray(value);
      if (valueAsArray.length <= 0) {
        newProps = newProps ?? {};
        newProps[propName] = (
          <PlaceHolder
            {...{
              [RUNTIME_PROP_STUDIO_SLOTS]: propName,
              [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'single',
            }}
            parentId={studioNodeId}
          />
        );
      }
    }
  });

  return newProps ? React.cloneElement(child, newProps) : child;
}

export interface WrappedStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

// Public interface with an `id` prop that will translate it into [RUNTIME_PROP_NODE_ID]
export function WrappedStudioNode({ children, id }: WrappedStudioNodeProps) {
  return (
    <WrappedStudioNodeInternal {...{ [RUNTIME_PROP_NODE_ID]: id }}>
      {children}
    </WrappedStudioNodeInternal>
  );
}

interface PageComponentProps {
  children?: React.ReactNode;
}

const PageComponent = React.forwardRef<HTMLDivElement, PageComponentProps>(function PageComponent(
  { children, ...props }: PageComponentProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <Container ref={ref} {...props}>
      <Stack direction="column" gap={2} my={2}>
        {children}
      </Stack>
    </Container>
  );
});

export const Page = createComponent(PageComponent, {
  props: {
    children: {
      type: 'slots',
      defaultValue: null,
    },
  },
});
