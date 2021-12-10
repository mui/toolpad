import { createComponent } from '@mui/studio-core';
import * as React from 'react';

interface TextComponentProps {
  children: string;
}

const defaultValue = 'Text';

const TextComponent = React.forwardRef(function TextComponent(
  { children, ...props }: TextComponentProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} style={{ padding: 10 }} {...props}>
      {children}
    </div>
  );
});

export default createComponent(TextComponent, {
  props: { children: { type: 'string', defaultValue } },
});
