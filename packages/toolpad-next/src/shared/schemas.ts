import * as z from 'zod';

export const COLUMN_TYPES = ['string', 'number', 'boolean', 'date', 'datetime'] as const;

export type ColumnType = (typeof COLUMN_TYPES)[number];

export const rowsSpecSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('property'),
  }),
  z.object({
    kind: z.literal('fetch'),
    method: z.enum(['GET', 'POST']).optional(),
    url: z.string().optional(),
    selector: z.string().optional(),
  }),
]);

export type RowsSpec = z.infer<typeof rowsSpecSchema>;

export const columnDefinitionSchema = z.object({
  field: z.string(),
  type: z.enum(COLUMN_TYPES).optional(),
  valueSelector: z.string().optional(),
});

export type ColumnDefinitionSpec = z.infer<typeof columnDefinitionSchema>;

export const columnDefinitionsSchema = z.array(columnDefinitionSchema);

export type ColumnDefinitionsSpec = z.infer<typeof columnDefinitionsSchema>;

export const dataGridSpecSchema = z.object({
  heightMode: z.enum(['auto', 'container', 'fixed']).optional(),
  height: z.number().optional(),
  rows: rowsSpecSchema.optional(),
  columns: columnDefinitionsSchema.optional(),
  rowIdSelector: z.string().optional(),
});

export type DataGridSpec = z.infer<typeof dataGridSpecSchema>;

export const dataGridFileSchema = z.object({
  kind: z.literal('DataGrid'),
  spec: dataGridSpecSchema.optional(),
});

export type DataGridFile = z.infer<typeof dataGridFileSchema>;

export const themeSchema = z.object({
  kind: z.literal('Theme'),
  spec: z.object({}).optional(),
});

export type ThemeFile = z.infer<typeof dataGridFileSchema>;

export const toolpadFileSchema = z.union([dataGridFileSchema, themeSchema]);

export type ToolpadFile = z.infer<typeof toolpadFileSchema>;
