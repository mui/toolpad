import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/toolpad-core';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import markdown from './Markdown';
import event from './event';
import GridColumns from './GridColumns';
import SelectOptions from './SelectOptions';
import HorizontalAlign from './HorizontalAlign';
import VerticalAlign from './VerticalAlign';
import RowIdFieldSelect from './RowIdFieldSelect';
import { EditorProps } from '../../types';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: React.FC<EditorProps<any>>;
} = {
  string,
  boolean,
  number,
  select,
  json,
  markdown,
  event,
  GridColumns,
  SelectOptions,
  RowIdFieldSelect,
  HorizontalAlign,
  VerticalAlign,
};

function getDefaultControlForType(propType: PropValueType): React.FC<EditorProps<any>> | null {
  switch (propType.type) {
    case 'string':
      return propType.enum ? select : string;
    case 'number':
      return number;
    case 'boolean':
      return boolean;
    case 'object':
      return json;
    case 'array':
      return json;
    case 'event':
      return event;
    default:
      return null;
  }
}

const modePropTypeMap = new Map<string, ArgControlSpec['type']>([
  // Text component modes
  ['text', 'string'],
  ['markdown', 'markdown'],
  ['link', 'string'],
]);

export function getDefaultControl<P extends { [key in string]?: unknown }>(
  argType: ArgTypeDefinition<P>,
  liveProps?: P,
): React.FC<EditorProps<any>> | null {
  if (argType.control) {
    if (argType.control.type === 'markdown') {
      if (liveProps) {
        const { mode } = liveProps;
        if (mode && typeof mode === 'string') {
          const mappedControlFromMode = modePropTypeMap.get(mode);
          if (!mappedControlFromMode) {
            return null;
          }
          return propTypeControls[mappedControlFromMode] ?? null;
        }
      }
    }
    return propTypeControls[argType.control.type] ?? getDefaultControlForType(argType);
  }

  return getDefaultControlForType(argType);
}

export default propTypeControls;
