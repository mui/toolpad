import * as path from 'path';
import type { GridColDef } from '@mui/x-data-grid-pro';
import { format } from './prettier';
import { DataGridFile, ToolpadFile } from './schemas';
import { WithDevtoolParams } from './types';
import * as jsonPointer from './jsonPointer';

export type GeneratedFile = {
  code: string;
};

function isValidFileNAme(base: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(base);
}

export function getNameFromPath(filePath: string): string {
  const name = path.basename(filePath, '.yml');

  if (!isValidFileNAme(name)) {
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

export type GenerateComponentConfig =
  | {
      dev?: false;
    }
  | {
      dev: true;
      wsUrl: string;
    };

export async function generateDataGridComponent(
  name: string,
  file: DataGridFile,
  config: GenerateComponentConfig,
): Promise<GeneratedFile> {
  const hasRowsProperty = (file.spec?.rows?.kind ?? 'property') === 'property';

  const columnDefs: string[] =
    file.spec?.columns?.map((column) => {
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
    ${config.dev ? `import { withDevtool, EditButton } from '@mui/toolpad-next/runtime';` : ''}

    ${
      file.spec.rows.kind === 'fetch'
        ? `
      async function executeFetch() {
        const response = await fetch(${JSON.stringify(file.spec.rows.url || '')}, { 
          method: ${JSON.stringify(file.spec.rows.method || 'GET')} 
        });
      
        if (!response.ok) {
          throw new Error(\`Request failed with status \${response.status}\`);
        }
      
        const data = await response.json();

        return ${jsonPointer.toExpression('data', file.spec.rows.selector || '/')};
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
      ${file.spec.rows.kind === 'property' ? 'rows = [], error' : ''}
    }: ToolpadDataGridProps) {

      ${
        file.spec.rows.kind === 'fetch'
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
            {error ? (
              <ErrorOverlay error={error} />
            ) : (
              <DataGridPro
                rows={rows}
                columns={columns}
                ${
                  file.spec.rowIdSelector
                    ? `getRowId={(row) => ${jsonPointer.toExpression(
                        'row',
                        file.spec.rowIdSelector || '/',
                      )}}`
                    : ''
                }
              />
            )}
          </ErrorBoundary>
          ${
            config.dev
              ? `<EditButton sx={{ position: 'absolute', bottom: 0, right: 0, mb: 2, mr: 2, zIndex: 1 }} />`
              : ''
          }
        </Box>
      )
    }

    ToolpadDataGrid.displayName = ${JSON.stringify(name)};

    export default ${
      config.dev
        ? `withDevtool(ToolpadDataGrid, ${JSON.stringify({
            name,
            file,
            wsUrl: config.wsUrl,
          } satisfies WithDevtoolParams)})`
        : 'ToolpadDataGrid'
    };
  `;

  return { code: await format(code) };
}

export async function generateComponent(
  name: string,
  file: ToolpadFile,
  config: GenerateComponentConfig,
): Promise<GeneratedFile> {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(name, file, config);
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
