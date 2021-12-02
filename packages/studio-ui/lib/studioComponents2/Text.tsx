import { createComponent } from '@mui/studio-core';
import * as React from 'react';

interface TextComponentProps {
  value: string;
}

const defaultValue = 'Text';

function TextComponent({ value, ...props }: TextComponentProps) {
  return (
    <div style={{ padding: 10 }} {...props}>
      {value}
    </div>
  );
}

export default createComponent(TextComponent, {
  props: { value: { type: 'string', defaultValue } },
});
