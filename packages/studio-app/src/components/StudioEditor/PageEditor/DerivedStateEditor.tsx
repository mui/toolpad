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
  List,
  ListItem,
  DialogActions,
  debounce,
} from '@mui/material';
import * as React from 'react';
import Editor from '@monaco-editor/react';
import { PropValueType, PropValueTypes } from '@mui/studio-core';
import type * as monacoEditor from 'monaco-editor';
import CloseIcon from '@mui/icons-material/Close';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import { ExactEntriesOf, WithControlledProp } from '../../../utils/types';
import { omit, update } from '../../../utils/immutability';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBindable, StudioBindables } from '../../../types';
import { BindingEditor } from '../BindingEditor';

const DERIVED_STATE_PARAMS = 'StudioDerivedStateParams';
const DERIVED_STATE_RESULT = 'StudioDerivedStateResult';

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
      // TODO: use something like https://www.npmjs.com/package/json-schema-to-typescript
      // to generate types from a provided schema in [propValueType.schema]
      return `any[]`;
    }
    case 'object': {
      return 'any';
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

interface StudioNodePropsEditorProps<P>
  extends WithControlledProp<StudioBindables<P>>,
    WithControlledProp<PropValueTypes<keyof P & string>, 'argTypes'> {
  nodeId: NodeId;
}

function StudioNodePropsEditor<P>({
  nodeId,
  value,
  onChange,
  argTypes,
  onArgTypesChange,
}: StudioNodePropsEditorProps<P>) {
  const { viewState } = usePageEditorState();
  const globalScope = viewState.pageState;

  const handlePropValueChange = React.useCallback(
    (param: keyof P & string) => (newValue: StudioBindable<any> | null) => {
      if (newValue) {
        onChange({ ...value, [param]: newValue });
      }
    },
    [onChange, value],
  );

  const handlePropTypeChange = React.useCallback(
    (param: keyof P & string) => (newPropType: PropValueType) => {
      onArgTypesChange(
        update(argTypes, {
          [param]: newPropType,
        } as Partial<PropValueTypes<keyof P & string>>),
      );
    },
    [onArgTypesChange, argTypes],
  );

  const handlePropRemove = React.useCallback(
    (param: keyof P & string) => () => {
      onChange(omit(value, param) as StudioBindables<P>);
      onArgTypesChange(omit(argTypes, param) as PropValueTypes<keyof P & string>);
    },
    [onChange, value, onArgTypesChange, argTypes],
  );

  return (
    <Stack>
      {(Object.entries(argTypes) as ExactEntriesOf<PropValueTypes<keyof P & string>>).map(
        ([propName, propType]) => {
          if (!propType) {
            return null;
          }
          const bindingId = `${nodeId}.props.${propName}`;
          const liveBinding = viewState.bindings[bindingId];
          const propValue: StudioBindable<any> | null = value[propName] ?? null;
          const isBound = !!propValue;
          return (
            <Stack key={propName} direction="row" alignItems="center" gap={1}>
              {propName}:
              <PropValueTypeSelector
                value={propType}
                onChange={handlePropTypeChange(propName)}
                disabled={isBound}
              />
              <BindingEditor
                globalScope={globalScope}
                liveBinding={liveBinding}
                propType={propType}
                value={propValue}
                onChange={handlePropValueChange(propName)}
              />
              <IconButton onClick={handlePropRemove(propName)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          );
        },
      )}
    </Stack>
  );
}

interface DerivedStateNodeEditorProps<P> {
  node: studioDom.StudioDerivedStateNode<P>;
}

function DerivedStateNodeEditor<P>({ node }: DerivedStateNodeEditorProps<P>) {
  const monacoRef = React.useRef<typeof monacoEditor>();
  const domApi = useDomApi();

  const libSource = React.useMemo(() => {
    const args = (
      Object.entries(node.attributes.argTypes.value) as ExactEntriesOf<PropValueTypes>
    ).map(([propName, paramType]) => {
      const tsType = paramType ? tsTypeForPropValueType(paramType) : 'unknown';
      return `${propName}: ${tsType};`;
    });

    return `
      declare interface ${DERIVED_STATE_PARAMS} {
        ${args.join('\n')}
      }

      declare type ${DERIVED_STATE_RESULT} = ${tsTypeForPropValueType(
      node.attributes.returnType.value,
    )}
    `;
  }, [node.attributes.argTypes.value, node.attributes.returnType.value]);

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
    domApi.setNodeNamespacedProp(
      node,
      'attributes',
      'argTypes',
      studioDom.createConst(
        update(node.attributes.argTypes.value, {
          [newPropName]: { type: 'string' },
        } as Partial<PropValueTypes<keyof P & string>>),
      ),
    );
    setnewPropName('');
  }, [domApi, node, newPropName]);

  const handlePropTypesChange = React.useCallback(
    (argTypes: PropValueTypes<keyof P & string>) =>
      domApi.setNodeNamespacedProp(node, 'attributes', 'argTypes', studioDom.createConst(argTypes)),
    [domApi, node],
  );

  const handleReturnTypeChange = React.useCallback(
    (returnType: PropValueType) =>
      domApi.setNodeNamespacedProp(
        node,
        'attributes',
        'returnType',
        studioDom.createConst(returnType),
      ),
    [domApi, node],
  );

  const handleCodeChange = React.useMemo(
    () =>
      debounce(
        (code: string = '') =>
          domApi.setNodeNamespacedProp(node, 'attributes', 'code', studioDom.createConst(code)),

        240,
      ),
    [domApi, node],
  );

  const handleParamsChange = React.useCallback(
    (params: StudioBindables<P>) => {
      domApi.setNodeNamespace(node, 'params', params);
    },
    [domApi, node],
  );

  return (
    <Stack gap={1} my={1}>
      <StudioNodePropsEditor
        nodeId={node.id}
        value={node.params ?? {}}
        onChange={handleParamsChange}
        argTypes={node.attributes.argTypes.value}
        onArgTypesChange={handlePropTypesChange}
      />
      <Stack direction="row" alignItems="center" gap={1}>
        <TextField
          value={newPropName}
          onChange={(event) => setnewPropName(event.target.value)}
          size="small"
        />
        <Button
          disabled={
            !newPropName || Object.keys(node.attributes.argTypes.value).includes(newPropName)
          }
          onClick={handleAddProp}
        >
          Add prop
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1}>
        State type:
        <PropValueTypeSelector
          value={node.attributes.returnType.value}
          onChange={handleReturnTypeChange}
        />
      </Stack>
      <Editor
        height="200px"
        value={node.attributes.code.value}
        onChange={handleCodeChange}
        path="./component.tsx"
        language="typescript"
        onMount={HandleEditorMount}
      />
    </Stack>
  );
}

export default function DerivedStateEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedState, setEditedState] = React.useState<NodeId | null>(null);
  const editedStateNode = editedState ? studioDom.getNode(dom, editedState, 'derivedState') : null;

  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId, 'page');

  const { derivedStates = [] } = studioDom.getChildNodes(dom, page);

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'derivedState', {
      params: {},
      attributes: {
        argTypes: studioDom.createConst({}),
        returnType: studioDom.createConst({
          type: 'string',
        }),
        code: studioDom.createConst(`/**
   * TODO: comment explaining how to derive state...
   */
  
  export default function getDerivedState (params: ${DERIVED_STATE_PARAMS}): ${DERIVED_STATE_RESULT} {
    return 'Hello World!';
  }\n`),
      },
    });
    domApi.addNode(stateNode, page, 'derivedStates');
    setEditedState(stateNode.id);
  }, [dom, domApi, page]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleRemove = React.useCallback(() => {
    if (editedStateNode) {
      domApi.removeNode(editedStateNode.id);
    }
    handleEditStateDialogClose();
  }, [editedStateNode, handleEditStateDialogClose, domApi]);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" onClick={handleCreate}>
        create derived state
      </Button>
      <List>
        {derivedStates.map((stateNode) => {
          return (
            <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode.id)}>
              {stateNode.name}
            </ListItem>
          );
        })}
      </List>

      {lastEditedStateNode ? (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
        >
          <DialogTitle>Edit Derived State ({lastEditedStateNode.id})</DialogTitle>
          <DialogContent>
            <DerivedStateNodeEditor node={lastEditedStateNode} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemove}>Remove</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
