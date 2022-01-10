import { ArgControlSpec } from '@mui/studio-core';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import dataQuery from './dataQuery';
import { PropControlDefinition } from '../types';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: PropControlDefinition;
} = {
  string,
  boolean,
  number,
  dataQuery,
  select,
};

export default propTypeControls;
