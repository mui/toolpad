import { PropControlDefinition, ArgControlSpec } from '../../types';
import string from './string';
import boolean from './boolean';
import number from './number';
import select from './select';
import json from './json';
import GridColumns from './GridColumns';
import HorizontalAlign from './HorizontalAlign';
import VerticalAlign from './VerticalAlign';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: PropControlDefinition;
} = {
  string,
  boolean,
  number,
  select,
  json,
  GridColumns,
  HorizontalAlign,
  VerticalAlign,
};

export default propTypeControls;
