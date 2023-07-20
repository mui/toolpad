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

export const columnsSpecSchema = z.array(
  z.object({
    field: z.string(),
    type: z.enum(COLUMN_TYPES).optional(),
  }),
);

export type ColumnsSpec = z.infer<typeof columnsSpecSchema>;

export const dataGridFileSchema = z.object({
  kind: z.literal('DataGrid'),
  spec: z
    .object({
      rows: rowsSpecSchema.optional(),
      columns: columnsSpecSchema.optional(),
    })
    .optional(),
});

export type DataGridFile = z.infer<typeof dataGridFileSchema>;

export const themeSchema = z.object({
  kind: z.literal('Theme'),
  spec: z.object({}).optional(),
});

export type ThemeFile = z.infer<typeof dataGridFileSchema>;

export const toolpadFileSchema = z.union([dataGridFileSchema, themeSchema]);

export type ToolpadFile = z.infer<typeof toolpadFileSchema>;
