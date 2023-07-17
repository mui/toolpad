import * as path from 'path';
import { GridColDef } from '@mui/x-data-grid-pro';
import serializeJavascript from 'serialize-javascript';
import { format } from './prettier';
import { DataGridFile, ToolpadFile } from '../shared/schemas';
import { WithDevtoolParams } from '../shared/types';

function isValidJsIdentifier(base: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(base);
}

function getNameFromPath(filePath: string): string {
  const name = path.basename(filePath, '.yml');

  if (!isValidJsIdentifier(name)) {
    throw new Error(`Invalid file name ${JSON.stringify(name)}`);
  }

  return name;
}

function serializeObject(properties: Record<string, string>): string {
  return `{${Object.entries(properties)
    .map((entry) => entry.join(': '))
    .join(', ')}}`;
}
function serializeArray(items: string[]): string {
  return `[${items.join(', ')}]`;
}

type SerializedProperties<O> = {
  [K in keyof O]: string | (undefined extends O[K] ? undefined : never);
};

interface GenerateComponentConfig {
  name: string;
  dev: boolean;
  wsUrl: string;
}

export async function generateDataGridComponent(
  dataGridFile: DataGridFile,
  { name, dev, wsUrl }: GenerateComponentConfig,
) {
  const hasRowsProperty = (dataGridFile.spec?.rows?.kind ?? 'property') === 'property';

  const columnDefs: string[] =
    dataGridFile.spec?.columns?.map((column) => {
      const properties: SerializedProperties<GridColDef> = {
        field: JSON.stringify(column.field),
      };

      if (column.type) {
        properties.type = JSON.stringify(column.type);
      }

      return serializeObject(properties);
    }) || [];

  const code = `
    import * as React from 'react';
    import { DataGridPro } from '@mui/x-data-grid-pro';
    import { Box } from '@mui/material';
    ${dev ? `import { withDevtool, EditButton } from '@mui/toolpad-next/runtime';` : ''}

    const columns = ${serializeArray(columnDefs)};

    export interface ToolpadDataGridProps {
      rows: ${hasRowsProperty ? '{ id: string | number }[]' : 'undefined'};
    }

    function ToolpadDataGrid({ rows = [] }: ToolpadDataGridProps) {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
          <DataGridPro rows={rows} columns={columns} />
          ${
            dev
              ? `<EditButton sx={{ position: 'absolute', bottom: 0, right: 0, mb: 2, mr: 2, zIndex: 1 }} />`
              : ''
          }
        </Box>
      )
    }

    ToolpadDataGrid.displayName = ${JSON.stringify(name)};

    export default ${
      dev
        ? `withDevtool(ToolpadDataGrid, ${serializeJavascript({
            name,
            file: dataGridFile,
            wsUrl,
          } satisfies WithDevtoolParams)})`
        : 'ToolpadDataGrid'
    };
  `;

  return format(code);
}

export async function generateComponent(file: ToolpadFile, config: GenerateComponentConfig) {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(file, config);
    default:
      throw new Error(`No implementation yet for ${JSON.stringify(file.kind)}`);
  }
}

export async function generateIndex(entries: string[]): Promise<string> {
  return entries
    .map((entryPath) => {
      const name = getNameFromPath(entryPath);
      return `export { default as ${name} } from './${name}';`;
    })
    .join('\n');
}
