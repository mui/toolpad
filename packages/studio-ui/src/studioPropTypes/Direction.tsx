import type { PropTypeDefinition } from '../types';
import { createSelectEditor } from './selectEditor';

type DirectionType = 'row' | 'column' | 'row-reverse' | 'column-reverse';

const Direction: PropTypeDefinition<DirectionType> = {
  Editor: createSelectEditor(['row', 'column', 'row-reverse', 'column-reverse']),
};

export default Direction;
