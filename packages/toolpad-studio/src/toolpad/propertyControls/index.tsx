import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@toolpad/studio-runtime';
import { createProvidedContext } from '@toolpad/utils/react';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import event from './event';
import { EditorProps } from '../../types';

export type PropTypeControls = {
  [key in ArgControlSpec['type']]?: React.FC<EditorProps<any>>;
};

export const [usePropControlsContext, PropControlsContextProvider] =
  createProvidedContext<PropTypeControls>('PropControls');

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
  controls: PropTypeControls,
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
          return controls[mappedControlFromMode] ?? null;
        }
      }
    }
    return controls[argType.control.type] ?? getDefaultControlForType(argType);
  }

  return getDefaultControlForType(argType);
}
