import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import React from 'react';
import CodeIcon from '@mui/icons-material/Code';
import PageIcon from '@mui/icons-material/Web';
import SourceIcon from '@mui/icons-material/Source';
import Editor from '@monaco-editor/react';
import { PropValueType, PrimitiveValueType } from '@mui/studio-core';
import type * as monacoEditor from 'monaco-editor';
import renderPageCode from '../../../renderPageCode';
import useLatest from '../../../utils/useLatest';
import { useDom } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import { ExactEntriesOf, WithControlledProp } from '../../../utils/types';
import { StudioNodeProps } from '../../../types';
import { update } from '../../../utils/immutability';

const DERIVED_STATE_PARAMS = 'StudioDerivedStateParams';
const DERIVED_STATE_RESULT = 'StudioDerivedStateResult';

type ParamTypes<P> = {
  [K in keyof P & string]: PrimitiveValueType;
};

interface DerivedStateNode<P = {}> {
  code: string;
  props: StudioNodeProps<P>;
  paramTypes: ParamTypes<P>;
  returnType: PrimitiveValueType;
}

interface DerivedStateEditorProps<P> extends WithControlledProp<DerivedStateNode<P>> {}

function tsTypeForPropValueType(propValueType: PropValueType): string {
  switch (propValueType.type) {
    case 'string': {
      if (propValueType.enum) {
        return propValueType.enum.map((value) => JSON.stringify(value)).join(' | ');
      }
      return 'string';
    }
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array': {
      const itemType = propValueType.items
        ? tsTypeForPropValueType(propValueType.items)
        : 'unknown';
      return `${itemType}[]`;
    }
    case 'object': {
      if (propValueType.properties) {
        const typeFields = Object.entries(propValueType.properties).map(([propName, propType]) => {
          return `${propName}: ${tsTypeForPropValueType(propType)}`;
        });
        return `{${typeFields.join('; ')}}`;
      }
      return '{}';
    }
    default:
      throw new Error(`Unsupported argtype "${propValueType.type}"`);
  }
}

interface PropValueTypeSelectorProps extends WithControlledProp<PrimitiveValueType> {
  disabled?: boolean;
}

function PropValueTypeSelector({ value, onChange, disabled }: PropValueTypeSelectorProps) {
  return (
    <FormControl size="small">
      <InputLabel id="select-connection-type">Type</InputLabel>
      <Select
        labelId="select-connection-type"
        disabled={disabled}
        size="small"
        value={value.type}
        label="Type"
        onChange={(event) => onChange({ type: event.target.value as PrimitiveValueType['type'] })}
      >
        <MenuItem value="string">string</MenuItem>
        <MenuItem value="number">number</MenuItem>
        <MenuItem value="boolean">boolean</MenuItem>
      </Select>
    </FormControl>
  );
}

function DerivedStateEditor<P>({ value, onChange }: DerivedStateEditorProps<P>) {
  const monacoRef = React.useRef<typeof monacoEditor>();

  const libSource = React.useMemo(() => {
    const args = (Object.entries(value.paramTypes) as ExactEntriesOf<ParamTypes<P>>).map(
      ([propName, paramType]) => {
        const tsType = paramType ? tsTypeForPropValueType(paramType) : 'unknown';
        return `${propName}: ${tsType};`;
      },
    );

    return `
      declare interface ${DERIVED_STATE_PARAMS} {
        ${args.join('\n')}
      }

      declare type ${DERIVED_STATE_RESULT} = ${tsTypeForPropValueType(value.returnType)}
    `;
  }, [value.paramTypes, value.returnType]);

  const libSourceDisposable = React.useRef<monacoEditor.IDisposable>();
  const setLibSource = React.useCallback(() => {
    libSourceDisposable.current?.dispose();
    if (monacoRef.current) {
      libSourceDisposable.current =
        monacoRef.current.languages.typescript.typescriptDefaults.addExtraLib(
          libSource,
          'file:///node_modules/@mui/studio/index.d.ts',
        );
    }
  }, [libSource]);
  React.useEffect(() => () => libSourceDisposable.current?.dispose(), []);

  React.useEffect(() => setLibSource(), [setLibSource]);

  const HandleEditorMount = React.useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
      monacoRef.current = monaco;

      editor.updateOptions({
        minimap: { enabled: false },
        accessibilitySupport: 'off',
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      setLibSource();
    },
    [setLibSource],
  );

  const [newPropName, setnewPropName] = React.useState('');
  const handleAddProp = React.useCallback(() => {
    onChange(
      update(value, {
        ...value,
        paramTypes: update(value.paramTypes, {
          [newPropName]: { type: 'string' },
        }),
      }),
    );
    setnewPropName('');
  }, [onChange, value, newPropName]);

  const handlePropTypeChange = React.useCallback(
    (propName: string) => (newPropType: PrimitiveValueType) => {
      onChange(
        update(value, {
          ...value,
          paramTypes: update(value.paramTypes, {
            [propName]: newPropType,
          }),
        }),
      );
    },
    [onChange, value],
  );

  const handleReturnTypeChange = React.useCallback(
    (newReturnType: PrimitiveValueType) => {
      onChange(
        update(value, {
          ...value,
          returnType: newReturnType,
        }),
      );
    },
    [onChange, value],
  );

  return (
    <div>
      <Stack gap={1} my={1}>
        {(Object.entries(value.paramTypes) as ExactEntriesOf<ParamTypes<P>>).map(
          ([propName, propType]) => {
            const isBound = !!value.props[propName];
            return (
              <Stack key={propName} direction="row" alignItems="center" gap={1}>
                {propName}:
                <PropValueTypeSelector
                  value={propType}
                  onChange={handlePropTypeChange(propName)}
                  disabled={isBound}
                />
              </Stack>
            );
          },
        )}
        <Stack direction="row" alignItems="center" gap={1}>
          <TextField
            value={newPropName}
            onChange={(event) => setnewPropName(event.target.value)}
            size="small"
          />
          <Button
            disabled={!newPropName || Object.keys(value.paramTypes).includes(newPropName)}
            onClick={handleAddProp}
          >
            Add prop
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          State type:
          <PropValueTypeSelector value={value.returnType} onChange={handleReturnTypeChange} />
        </Stack>
      </Stack>
      <Editor
        height="200px"
        value={value.code}
        onChange={(newValue = '') => onChange({ ...value, code: newValue })}
        path="./component.tsx"
        language="typescript"
        onMount={HandleEditorMount}
      />
    </div>
  );
}

function CreateDerivedStateDialog(props: DialogProps) {
  const [input, setInput] = React.useState<DerivedStateNode>({
    paramTypes: {},
    returnType: {
      type: 'string',
    },
    props: {},
    code: `/**
* TODO: comment explaining how to derive state...
*/

export default function getDerivedState (params: ${DERIVED_STATE_PARAMS}): ${DERIVED_STATE_RESULT} {
  return 'Hello World!';
}\n`,
  });

  return (
    <Dialog fullWidth maxWidth="lg" {...props}>
      <DialogTitle>Create Derived State</DialogTitle>
      <DialogContent>
        <DerivedStateEditor value={input} onChange={setInput} />
      </DialogContent>
    </Dialog>
  );
}

export default function PageOptionsPanel() {
  const dom = useDom();
  const state = usePageEditorState();
  const [viewedSource, setViewedSource] = React.useState<string | null>(null);
  const [createStateDialogOpen, setCreateStateDialogOpen] = React.useState(false);

  const handleViewSource = React.useCallback(() => {
    const { code } = renderPageCode(dom, state.nodeId, { pretty: true });
    setViewedSource(code);
  }, [dom, state.nodeId]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  const handleCreateStateDialogOpen = React.useCallback(() => setCreateStateDialogOpen(true), []);
  const handleCreateStateDialogClose = React.useCallback(() => setCreateStateDialogOpen(false), []);

  // To keep it around during closing animation
  const dialogSourceContent = useLatest(viewedSource);
  return (
    <div>
      <Stack spacing={1} alignItems="start">
        <Button
          startIcon={<PageIcon />}
          color="inherit"
          component="a"
          href={`/pages/${state.nodeId}`}
        >
          View Page
        </Button>
        <Button startIcon={<SourceIcon />} color="inherit" onClick={handleViewSource}>
          View Page Source
        </Button>
        <Button
          startIcon={<CodeIcon />}
          color="inherit"
          component="a"
          href={`/api/export/${state.nodeId}`}
        >
          Page Component
        </Button>
        <Button color="inherit" onClick={handleCreateStateDialogOpen}>
          create derived state
        </Button>
      </Stack>
      <Dialog fullWidth maxWidth="lg" open={!!viewedSource} onClose={handleViewedSourceDialogClose}>
        <DialogTitle>Page component</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
      <CreateDerivedStateDialog
        open={createStateDialogOpen}
        onClose={handleCreateStateDialogClose}
      />
    </div>
  );
}
