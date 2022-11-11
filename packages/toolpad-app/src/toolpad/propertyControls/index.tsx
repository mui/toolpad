import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/toolpad-core';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import event from './event';
import GridColumns from './GridColumns';
import SelectOptions from './SelectOptions';
import HorizontalAlign from './HorizontalAlign';
import VerticalAlign from './VerticalAlign';
import RowIdFieldSelect from './RowIdFieldSelect';
import Markdown from './Markdown';
import { EditorProps } from '../../types';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: React.FC<EditorProps<any>>;
} = {
  string,
  boolean,
  number,
  select,
  json,
  event,
  GridColumns,
  Markdown,
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

export function getDefaultControl(argType: ArgTypeDefinition): React.FC<EditorProps<any>> | null {
  if (argType.control) {
    return propTypeControls[argType.control.type] ?? getDefaultControlForType(argType.typeDef);
  }

  return getDefaultControlForType(argType.typeDef);
}

export default propTypeControls;
