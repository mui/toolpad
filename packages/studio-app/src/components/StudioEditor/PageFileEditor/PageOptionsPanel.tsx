import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  DialogActions,
  List,
  ListItem,
} from '@mui/material';
import React from 'react';
import CodeIcon from '@mui/icons-material/Code';
import PageIcon from '@mui/icons-material/Web';
import SourceIcon from '@mui/icons-material/Source';
import Editor from '@monaco-editor/react';
import { PropValueType, PropValueTypes } from '@mui/studio-core';
import type * as monacoEditor from 'monaco-editor';
import CloseIcon from '@mui/icons-material/Close';
import renderPageCode from '../../../renderPageCode';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import { ExactEntriesOf, WithControlledProp } from '../../../utils/types';
import { omit, update } from '../../../utils/immutability';
import * as studioDom from '../../../studioDom';
import { NodeId } from '../../../types';
import BindingEditor from './BindingEditor';

const DERIVED_STATE_PARAMS = 'StudioDerivedStateParams';
const DERIVED_STATE_RESULT = 'StudioDerivedStateResult';

interface DerivedStateEditorProps<P = any>
  extends WithControlledProp<studioDom.StudioDerivedStateNode<P>> {}

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

interface PropValueTypeSelectorProps extends WithControlledProp<PropValueType> {
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
        onChange={(event) => onChange({ type: event.target.value as PropValueType['type'] })}
      >
        <MenuItem value="string">string</MenuItem>
        <MenuItem value="number">number</MenuItem>
        <MenuItem value="boolean">boolean</MenuItem>
      </Select>
    </FormControl>
  );
}

function DerivedStateEditor({ value, onChange }: DerivedStateEditorProps) {
  const monacoRef = React.useRef<typeof monacoEditor>();

  const libSource = React.useMemo(() => {
    const args = (Object.entries(value.argTypes) as ExactEntriesOf<PropValueTypes>).map(
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
  }, [value.argTypes, value.returnType]);

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
        argTypes: update(value.argTypes, {
          [newPropName]: { type: 'string' },
        }),
      }),
    );
    setnewPropName('');
  }, [onChange, value, newPropName]);

  const handlePropTypeChange = React.useCallback(
    (propName: string) => (newPropType: PropValueType) => {
      onChange(
        update(value, {
          ...value,
          argTypes: update(value.argTypes, {
            [propName]: newPropType,
          }),
        }),
      );
    },
    [onChange, value],
  );

  const handlePropRemove = React.useCallback(
    (propName: string) => () => {
      onChange(
        update(value, {
          ...value,
          argTypes: omit(value.argTypes, propName),
        }),
      );
    },
    [onChange, value],
  );

  const handleReturnTypeChange = React.useCallback(
    (newReturnType: PropValueType) => {
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
        {(Object.entries(value.argTypes) as ExactEntriesOf<PropValueTypes>).map(
          ([propName, propType]) => {
            if (!propType) {
              return null;
            }
            const isBound = !!value.props[propName];
            return (
              <Stack key={propName} direction="row" alignItems="center" gap={1}>
                {propName}:
                <PropValueTypeSelector
                  value={propType}
                  onChange={handlePropTypeChange(propName)}
                  disabled={isBound}
                />
                <BindingEditor nodeId={value.id} prop={propName} propType={propType} />
                <IconButton onClick={handlePropRemove(propName)}>
                  <CloseIcon />
                </IconButton>
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
            disabled={!newPropName || Object.keys(value.argTypes).includes(newPropName)}
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

interface EditDerivedStateDialogProps {
  open: boolean;
  onClose: () => void;
  nodeId: NodeId;
}

function EditDerivedStateDialog({ nodeId, open, onClose }: EditDerivedStateDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const node = studioDom.getNode(dom, nodeId);
  studioDom.assertIsDerivedState(node);

  const [input, setInput] = React.useState<studioDom.StudioDerivedStateNode<any>>(node);
  React.useEffect(() => setInput(node), [node]);

  const handleSave = React.useCallback(() => {
    domApi.saveNode(input);
    onClose();
  }, [domApi, input, onClose]);

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle>Edit Derived State ({input.id})</DialogTitle>
      <DialogContent>
        <DerivedStateEditor value={input} onChange={setInput} />
      </DialogContent>
      <DialogActions>
        <Button disabled={input === node} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PageOptionsPanel() {
  const dom = useDom();
  const state = usePageEditorState();
  const [viewedSource, setViewedSource] = React.useState<string | null>(null);
  const domApi = useDomApi();

  const handleViewSource = React.useCallback(() => {
    const { code } = renderPageCode(dom, state.nodeId, { pretty: true });
    setViewedSource(code);
  }, [dom, state.nodeId]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  const [editedStateNode, setEditedState] = React.useState<NodeId | null>(null);
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId);
  studioDom.assertIsPage(page);
  const stateNodes = studioDom.getChildNodes(dom, page).state ?? [];

  const pageNodeId = state.nodeId;
  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'derivedState', {
      argTypes: {},
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
    domApi.addNode(stateNode, pageNodeId, 'state');
    setEditedState(stateNode.id);
  }, [dom, domApi, pageNodeId]);

  const lastEditedStateNode = useLatest(editedStateNode);

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
        <Button color="inherit" onClick={handleCreate}>
          create derived state
        </Button>
        <List>
          {stateNodes.map((stateNode) => {
            return (
              <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode.id)}>
                {stateNode.name}
              </ListItem>
            );
          })}
        </List>
      </Stack>
      <Dialog fullWidth maxWidth="lg" open={!!viewedSource} onClose={handleViewedSourceDialogClose}>
        <DialogTitle>Page component</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
      {lastEditedStateNode ? (
        <EditDerivedStateDialog
          nodeId={lastEditedStateNode}
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
        />
      ) : null}
    </div>
  );
}
