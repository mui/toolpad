import * as path from 'path';
import type { GridColDef } from '@mui/x-data-grid-pro';
import { format } from './prettier';
import { DataGridFile, ToolpadFile } from './schemas';
import { WithDevtoolParams } from './types';

export type GeneratedFile = {
  code: string;
};

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
  wsUrl?: string;
}

function transformSelector(selector: string): string {
  return selector
    ? selector
        .split('.')
        .map((part) => `[${JSON.stringify(part)}]`)
        .join('')
    : '';
}

export async function generateDataGridComponent(
  dataGridFile: DataGridFile,
  { name, dev, wsUrl }: GenerateComponentConfig,
): Promise<GeneratedFile> {
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

    ${
      dataGridFile.spec.rows.kind === 'fetch'
        ? `
      async function executeFetch() {
        const response = await fetch(${JSON.stringify(dataGridFile.spec.rows.url || '')}, { 
          method: ${JSON.stringify(dataGridFile.spec.rows.method || 'GET')} 
        });
      
        if (!response.ok) {
          throw new Error(\`Request failed with status \${response.status}\`);
        }
      
        const data = await response.json();

        return data${transformSelector(dataGridFile.spec.rows.selector)};
      }
    `
        : ''
    }

    interface ErrorOverlayProps {
      error: Error;
    }

    function ErrorOverlay({ error }: ErrorOverlayProps) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          {String(error.message || error)}
        </Box>
      )
    }

    class ErrorBoundary extends React.Component<{ children?: React.ReactNode }> {
      state: { error: Error | null } = { error: null };
    
      static getDerivedStateFromError(error: any) {
        return { error };
      }
    
      render() {
        return this.state.error ? (
          <ErrorOverlay error={this.state.error} />
        ) : (
          this.props.children
        );
      }
    }

    const columns = ${serializeArray(columnDefs)};

    export interface ToolpadDataGridProps {
      rows: ${hasRowsProperty ? '{ id: string | number }[]' : 'undefined'};
    }

    function ToolpadDataGrid({ 
      ${dataGridFile.spec.rows.kind === 'property' ? 'rows = [], error' : ''}
    }: ToolpadDataGridProps) {

      ${
        dataGridFile.spec.rows.kind === 'fetch'
          ? `
        const [rows, setRows] = React.useState([]);
        const [error, setError] = React.useState()

        React.useEffect(() => {
          executeFetch().then(setRows, setError);
        }, [])
      `
          : ''
      }


      return (
        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
          <ErrorBoundary>
            {error ? <ErrorOverlay error={error} /> : <DataGridPro rows={rows} columns={columns} />}
          </ErrorBoundary>
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
        ? `withDevtool(ToolpadDataGrid, ${JSON.stringify({
            name,
            file: dataGridFile,
            wsUrl,
          } satisfies WithDevtoolParams)})`
        : 'ToolpadDataGrid'
    };
  `;

  return { code: await format(code) };
}

export async function generateComponent(
  file: ToolpadFile,
  config: GenerateComponentConfig,
): Promise<GeneratedFile> {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(file, config);
    default:
      throw new Error(`No implementation yet for ${JSON.stringify(file.kind)}`);
  }
}

export async function generateIndex(entries: string[]): Promise<GeneratedFile> {
  const code = entries
    .map((entryPath) => {
      const name = getNameFromPath(entryPath);
      return `export { default as ${name} } from './${name}';`;
    })
    .join('\n');

  return { code };
}
