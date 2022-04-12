import { JSONSchemaType } from 'ajv';
import { GridEnrichedColDef } from '@mui/x-data-grid-pro';
import { UseDataQuery } from './types';

type ToolpadColDef = Pick<GridEnrichedColDef, 'field' | 'align'>;
type ToolpadGridColumns = ToolpadColDef[];

type ToolpadRows = { id: string }[];

type SelectOption = {
  value: string;
  label?: string;
};

export const URI_DATAGRID_COLUMN = 'https://toolpad.mui.com/DataGridColumn.json';
export const URI_DATAGRID_COLUMNS = 'https://toolpad.mui.com/DataGridColumns.json';
export const URI_DATAGRID_ROWS = 'https://toolpad.mui.com/DataGridRows.json';
export const URI_DATAQUERY = 'https://toolpad.mui.com/DataQuery.json';
export const URI_SELECT_OPTIONS = 'https://toolpad.mui.com/SelectOptions.json';

export default {
  [URI_DATAGRID_COLUMN]: {
    type: 'object',
    additionalProperties: true,
    properties: {
      field: {
        type: 'string',
      },
      align: {
        type: 'string',
        nullable: true,
        enum: ['center', 'right', 'left'],
      },
    },
    required: ['field'],
  } as JSONSchemaType<ToolpadColDef>,
  [URI_DATAGRID_COLUMNS]: {
    type: 'array',
    items: {
      $ref: URI_DATAGRID_COLUMN,
    },
  } as JSONSchemaType<ToolpadGridColumns>,
  [URI_DATAGRID_ROWS]: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
      properties: {
        id: {
          type: 'string',
        },
      },
      required: ['id'],
    },
  } as JSONSchemaType<ToolpadRows>,
  [URI_DATAQUERY]: {
    type: 'object',
    properties: {
      loading: { type: 'boolean' },
      rows: { $ref: URI_DATAGRID_ROWS },
      error: {},
    },
  } as JSONSchemaType<UseDataQuery>,
  [URI_SELECT_OPTIONS]: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
      properties: {
        value: {
          type: 'string',
        },
        label: {
          type: 'string',
          nullable: true,
        },
      },
      required: ['value'],
    },
  } as JSONSchemaType<SelectOption[]>,
};
