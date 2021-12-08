import type { StudioComponentDefinition } from '../types';

interface TextComponentProps {
  children: string;
}

const defaultValue = 'Text';

const Text: StudioComponentDefinition<TextComponentProps> = {
  props: { children: { type: 'string', defaultValue } },
  module: '@mui/studio-components',
  importedName: 'Text',
};

export default Text;
