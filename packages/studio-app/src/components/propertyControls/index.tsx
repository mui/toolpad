import { ArgControlSpec } from '@mui/studio-core';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import { PropControlDefinition } from '../../types';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: PropControlDefinition;
} = {
  string,
  boolean,
  number,
  select,
  json,
};

export default propTypeControls;
