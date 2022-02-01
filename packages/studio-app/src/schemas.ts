import { JSONSchemaType } from 'ajv';
import { GridEnrichedColDef } from '@mui/x-data-grid-pro';

type StudioColDef = Pick<GridEnrichedColDef, 'field' | 'align'>;
type StudioGridColumns = StudioColDef[];

type StudioRows = { id: string }[];

export const URI_DATAGRID_COLUMN = 'https://studio.mui.com/DataGridColumn.json';
export const URI_DATAGRID_COLUMNS = 'https://studio.mui.com/DataGridColumns.json';
export const URI_DATAGRID_ROWS = 'https://studio.mui.com/DataGridRows.json';

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
  } as JSONSchemaType<StudioColDef>,
  [URI_DATAGRID_COLUMNS]: {
    type: 'array',
    items: {
      $ref: URI_DATAGRID_COLUMN,
    },
  } as JSONSchemaType<StudioGridColumns>,
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
  } as JSONSchemaType<StudioRows>,
};
