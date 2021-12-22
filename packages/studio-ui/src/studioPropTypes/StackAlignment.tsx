import type { PropTypeDefinition } from '../types';
import { createSelectEditor } from './selectEditor';

type StackAlignmentType = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

const stackAlignment: PropTypeDefinition<StackAlignmentType> = {
  Editor: createSelectEditor(['flex-start', 'center', 'flex-end', 'stretch', 'baseline']),
};

export default stackAlignment;
