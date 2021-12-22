import string from './string';
import boolean from './boolean';
import number from './number';
import GridSlots from './GridSlots';
import TextFieldVariant from './TextFieldVariant';
import ButtonVariant from './ButtonVariant';
import Direction from './Direction';
import Nodes from './Nodes';
import DataGridColumns from './DataGridColumns';
import DataGridRows from './DataGridRows';
import Node from './Node';
import StackAlignment from './StackAlignment';
import DataQuery from './DataQuery';
import Color from './Color';
import { PropTypeDefinition } from '../types';

const propTypes: {
  [key: string]: PropTypeDefinition<any> | undefined;
} = {
  string,
  boolean,
  number,
  GridSlots,
  TextFieldVariant,
  ButtonVariant,
  Direction,
  Nodes,
  DataGridColumns,
  DataGridRows,
  Node,
  StackAlignment,
  DataQuery,
  Color,
};

export default propTypes;
