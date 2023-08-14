import path from 'path-browserify';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from '../prettier';
import { DataGridFile } from '../schemas';
import { WithDevtoolParams } from '../types';
import * as jsonPointer from '../jsonPointer';
import type { CodeFiles, CodeGenerationResult, GenerateComponentOptions } from '.';
import { serializeObject, serializeArray, SerializedProperties } from './utils';
import { Scope } from './Scope';
import Imports from './Imports';
import { getComponentNameFromInputFile } from '../paths';

export default async function generateDataGridComponent(
  filePath: string,
  file: DataGridFile,
  options: GenerateComponentOptions,
): Promise<CodeGenerationResult> {
  const name = getComponentNameFromInputFile(filePath);

  const globalScope = new Scope();
  const imports = new Imports(globalScope);

  imports.addImport('react', '*', 'React');
  imports.addImport('@mui/x-data-grid', 'DataGrid', 'DataGrid');
  imports.addImport('@mui/material', 'Box', 'Box');
  if (options.target !== 'prod') {
    imports.addImport('@mui/toolpad-next/runtime', '*', '_runtime');
  }

  if (file.spec?.rows?.kind === 'fetch') {
    globalScope.allocate('executeFetch');
  }
  globalScope.allocate('columns');
  globalScope.allocate('ErrorOverlay');
  globalScope.allocate('ErrorOverlayProps');

  const componentName = globalScope.allocateSuggestion(name);
  const componentPropsName = globalScope.allocateSuggestion(`${name}Props`);

  const { outDir = '/' } = options;

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
    'use client';

    ${imports.print()}

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

        ${options.target === 'prod' ? '' : `_runtime.probes.update('fetch.rawData', data);`}

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

    export interface ${componentPropsName} {
      ${hasRowsProperty ? 'rows: { id: string | number }[];' : ''}
    }

    function ${componentName}({ 
      ${
        !file.spec?.rows?.kind || file.spec?.rows?.kind === 'property'
          ? 'rows = [], loading = false, error'
          : ''
      }
    }: ${componentPropsName}) {

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

      ${options.target === 'prod' ? '' : `_runtime.probes.useProbeTarget('rows', rows);`}


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
              <DataGrid
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
            options.target === 'dev'
              ? `<_runtime.EditButton sx={{ position: 'absolute', bottom: 0, right: 0, mb: 2, mr: 2, zIndex: 1 }} />`
              : ''
          }
        </Box>
      )
    }

    ${componentName}.displayName = ${JSON.stringify(name)};

    export default ${
      options.target === 'dev'
        ? `_runtime.withDevtool(${componentName}, ${serializeObject({
            filePath: JSON.stringify(filePath),
            file: JSON.stringify(file),
            dependencies: imports.printDynamicImports(),
            backend: (() => {
              switch (options.backend?.kind) {
                case 'cli': {
                  const wsUrl = options.backend.wsUrl;
                  return `new _runtime.CliBackendClient(${JSON.stringify(wsUrl)})`;
                }
                case 'browser': {
                  const port = options.backend.port;
                  return `new _runtime.BrowserBackendClient(window[${JSON.stringify(port)}])`;
                }
                default:
                  return 'new _runtime.NoopBackendClient()';
              }
            })(),
          } satisfies Record<keyof WithDevtoolParams, string>)})`
        : componentName
    };
  `;

  const fileName = path.join(outDir, name, 'index.tsx');

  const files: CodeFiles = [[fileName, { code: await format(code) }]];

  return { files };
}
