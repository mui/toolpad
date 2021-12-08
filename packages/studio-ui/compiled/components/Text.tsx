import { createComponent } from '@mui/studio-core';
import * as React from 'react';

interface TextComponentProps {
  children: string;
}

const defaultValue = 'Text';

function TextComponent({ children, ...props }: TextComponentProps) {
  return (
    <div style={{ padding: 10 }} {...props}>
      {children}
    </div>
  );
}

export default createComponent(TextComponent, {
  props: { children: { type: 'string', defaultValue } },
});
