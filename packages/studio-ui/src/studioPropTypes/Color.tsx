import type { PropTypeDefinition } from '../types';
import { createSelectEditor } from './selectEditor';

type Color = 'primary' | 'secondary';

const stackAlignment: PropTypeDefinition<Color> = {
  Editor: createSelectEditor(['primary', 'secondary']),
};

export default stackAlignment;
