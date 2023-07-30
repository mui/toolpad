import path from 'path-browserify';
import type { GridColDef } from '@mui/x-data-grid-pro';
import { format } from '../prettier';
import { DataGridFile } from '../schemas';
import { WithDevtoolParams } from '../types';
import * as jsonPointer from '../jsonPointer';
import type { CodeFiles, CodeGenerationResult, GenerateComponentConfig } from '../codeGeneration';

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

export default async function generateDataGridComponent(
  name: string,
  file: DataGridFile,
  config: GenerateComponentConfig,
): Promise<CodeGenerationResult> {
  const { outDir = '/' } = config;

  const hasRowsProperty = (file.spec?.rows?.kind ?? 'property') === 'property';

  const columnDefs: string[] =
    file.spec?.columns?.map((column) => {
      const properties: SerializedProperties<GridColDef> = {
        field: JSON.stringify(column.field),
      };

      if (column.type) {
        properties.type = JSON.stringify(column.type);
      }

      const defaultValueSelector = jsonPointer.encode([column.field]);
      if (column.valueSelector && column.valueSelector !== defaultValueSelector) {
        properties.valueGetter = `({ row }) => ${jsonPointer.toExpression(
          'row',
          column.valueSelector,
        )}`;
      }

      return serializeObject(properties);
    }) || [];

  const code = `
    import * as React from 'react';
    import { DataGridPro } from '@mui/x-data-grid-pro';
    import { Box } from '@mui/material';
    ${config.target === 'prod' ? '' : `import * as _runtime from '@mui/toolpad-next/runtime';`}

    ${
      file.spec?.rows?.kind === 'fetch'
        ? `
      async function executeFetch() {
        const response = await fetch(${JSON.stringify(file.spec.rows.url || '')}, { 
          method: ${JSON.stringify(file.spec.rows.method || 'GET')} 
        });
      
        if (!response.ok) {
          throw new Error(\`Request failed with status \${response.status}\`);
        }
      
        const data = await response.json();

        const result = ${jsonPointer.toExpression('data', file.spec.rows.selector || '')};

        ${
          config.target === 'prod'
            ? ''
            : `
                result[_runtime.TOOLPAD_INTERNAL] = {
                  rawData: data
                }
              `
        }

        return result
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
      ${
        !file.spec?.rows?.kind || file.spec?.rows?.kind === 'property'
          ? 'rows = [], loading = false, error'
          : ''
      }
    }: ToolpadDataGridProps) {

      ${
        file.spec?.rows?.kind === 'fetch'
          ? `
              const [rows, setRows] = React.useState([]);
              const [error, setError] = React.useState()
              const [loading, setLoading] = React.useState(false)

              React.useEffect(() => {
                setLoading(true)
                executeFetch().then(setRows, setError).finally(() => setLoading(false));
              }, [])
            `
          : ''
      }

      ${config.target === 'prod' ? '' : `_runtime.useProbeTarget('rows', rows);`}


      return (
        <Box sx={{ 
          position: 'relative', 
          width: '100%',
          ${file.spec?.heightMode === 'container' ? 'height: "100%"' : ''}
          ${file.spec?.heightMode === 'fixed' ? `height: ${file.spec?.height ?? 400}` : ''}
        }}>
          <ErrorBoundary>
            {error ? (
              <ErrorOverlay error={error} />
            ) : (
              <DataGridPro
                rows={rows}
                loading={loading}
                columns={columns}
                ${file.spec?.heightMode === 'auto' ? 'autoHeight' : ''}
                ${
                  file.spec?.rowIdSelector
                    ? `getRowId={(row) => ${jsonPointer.toExpression(
                        'row',
                        file.spec.rowIdSelector || '',
                      )}}`
                    : ''
                }
              />
            )}
          </ErrorBoundary>
          ${
            config.target === 'dev'
              ? `<_runtime.EditButton sx={{ position: 'absolute', bottom: 0, right: 0, mb: 2, mr: 2, zIndex: 1 }} />`
              : ''
          }
        </Box>
      )
    }

    ToolpadDataGrid.displayName = ${JSON.stringify(name)};

    export default ${
      config.target === 'dev'
        ? `_runtime.withDevtool(ToolpadDataGrid, ${serializeObject({
            name: JSON.stringify(name),
            file: JSON.stringify(file),
            wsUrl: JSON.stringify(config.wsUrl),
            dependencies: serializeArray([
              serializeArray([JSON.stringify('react'), 'React']),
              serializeArray([JSON.stringify('@mui/x-data-grid-pro'), '{ DataGridPro }']),
              serializeArray([JSON.stringify('@mui/material'), '{ Box }']),
              serializeArray([JSON.stringify('@mui/toolpad-next/runtime'), '_runtime']),
            ]),
          } satisfies Record<keyof WithDevtoolParams, string>)})`
        : 'ToolpadDataGrid'
    };
  `;

  const fileName = path.join(outDir, name, 'index.tsx');

  const files: CodeFiles = [[fileName, { code: await format(code) }]];

  return { files };
}
