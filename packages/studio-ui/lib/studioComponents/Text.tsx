import React from 'react';
import type { StudioComponentDefinition } from '../types';

interface TextComponentProps {
  value: string;
}

function TextComponent({ value, ...props }: TextComponentProps) {
  return (
    <div {...props} style={{ padding: 10 }}>
      {value}
    </div>
  );
}

const Text: StudioComponentDefinition<TextComponentProps> = {
  Component: React.memo(TextComponent),
  props: { value: { type: 'string', defaultValue: 'Text' } },
};

export default Text;
