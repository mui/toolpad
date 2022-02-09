import { ArgControlSpec } from '@mui/studio-core';
import { PropControlDefinition } from '../../types';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import GridColumns from './GridColumns';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: PropControlDefinition;
} = {
  string,
  boolean,
  number,
  select,
  json,
  GridColumns,
};

export default propTypeControls;
