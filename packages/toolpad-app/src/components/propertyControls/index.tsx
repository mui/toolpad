import { ArgControlSpec } from '@mui/toolpad-core';
import { PropControlDefinition } from '../../types';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import functionType from './function';
import GridColumns from './GridColumns';
import HorizontalAlign from './HorizontalAlign';
import VerticalAlign from './VerticalAlign';
import RowIdFieldSelect from './RowIdFieldSelect';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: PropControlDefinition;
} = {
  string,
  boolean,
  number,
  select,
  json,
  function: functionType,
  GridColumns,
  RowIdFieldSelect,
  HorizontalAlign,
  VerticalAlign,
};

export default propTypeControls;
