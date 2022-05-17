import { ArgControlSpec } from '@mui/toolpad-core';
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
import { EditorProps } from '../../types';

const propTypeControls: {
  [key in ArgControlSpec['type']]?: React.FC<EditorProps<any>>;
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
