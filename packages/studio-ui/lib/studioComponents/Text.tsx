import type { StudioComponentDefinition } from '../types';

interface TextComponentProps {
  value: string;
}

const defaultValue = 'Text';

const Text: StudioComponentDefinition<TextComponentProps> = {
  props: { value: { type: 'string', defaultValue } },
  render(context, resolvedProps) {
    const { value, ...other } = resolvedProps;
    return `
      <div 
        style={{ padding: 10 }} 
        ${context.renderProps(other)}
      >
        {${value || '""'}}
      </div>
    `;
  },
};

export default Text;
