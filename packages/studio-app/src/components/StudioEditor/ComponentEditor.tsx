import { Alert, IconButton, Stack, styled, TextField } from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import {
  ArgTypeDefinitions,
  ArgTypeDefinition,
  ArgControlSpec,
  PropValueType,
} from '@mui/studio-core';
import { getStudioComponent } from '../../studioComponents';
import studioPropControls from '../../studioPropTypeControls';
import { useEditorApi, usePageEditorState } from './EditorProvider';
import { ExactEntriesOf } from '../../utils/types';
import * as studioDom from '../../studioDom';

function getDefaultControl(typeDef: PropValueType): ArgControlSpec | null {
  switch (typeDef.type) {
    case 'string':
      return typeDef.enum ? { type: 'select' } : { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'object':
      return { type: 'object' };
    case 'array':
      return { type: 'object' };
    default:
      return null;
  }
}

const classes = {
  control: 'StudioControl',
};

const ComponentPropsEditorRoot = styled('div')(({ theme }) => ({
  [`& .${classes.control}`]: {
    margin: theme.spacing(1, 0),
  },
}));

interface ComponentPropEditorProps<P, K extends keyof P> {
  name: K;
  node: studioDom.StudioElementNode<P>;
  argType: ArgTypeDefinition;
  actualValue: unknown;
}

function ComponentPropEditor<P, K extends keyof P & string>({
  name,
  node,
  argType,
  actualValue,
}: ComponentPropEditorProps<P, K>) {
  const api = useEditorApi();

  const handleChange = React.useCallback(
    (value: unknown) => api.setNodeProp(node.id, name, { type: 'const', value }),
    [api, node.id, name],
  );

  const handleClickBind = React.useCallback(
    () => api.openBindingEditor(node.id, name),
    [api, node.id, name],
  );

  const controlSpec = argType.control ?? getDefaultControl(argType.typeDef);
  const control = controlSpec ? studioPropControls[controlSpec.type] : null;

  const propValue = node.props[name];

  const initPropValue = React.useCallback(() => {
    if (propValue?.type === 'const') {
      return propValue.value;
    }
    return actualValue;
  }, [actualValue, propValue]);

  const [value, setValue] = React.useState(initPropValue);

  React.useEffect(() => {
    setValue(initPropValue());
    return () => {};
  }, [propValue, initPropValue]);

  const hasBinding = propValue?.type === 'binding';

  return (
    <Stack direction="row" alignItems="flex-start">
      {control ? (
        <React.Fragment>
          <control.Editor
            name={name}
            argType={argType}
            disabled={hasBinding}
            value={value}
            onChange={handleChange}
          />
          <IconButton
            size="small"
            onClick={handleClickBind}
            color={hasBinding ? 'primary' : 'inherit'}
          >
            {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
          </IconButton>{' '}
        </React.Fragment>
      ) : (
        <Alert severity="warning">
          Unknown type &quot;{argType.typeDef.type}&quot; for property &quot;{name}&quot;
        </Alert>
      )}
    </Stack>
  );
}

interface ComponentPropsEditorProps<P> {
  node: studioDom.StudioElementNode<P>;
  actualValues: { [key: string]: unknown };
}

function ComponentPropsEditor<P>({ node, actualValues }: ComponentPropsEditorProps<P>) {
  const { dom } = usePageEditorState();
  const definition = getStudioComponent(dom, node.component);

  return (
    <ComponentPropsEditorRoot>
      {(Object.entries(definition.argTypes) as ExactEntriesOf<ArgTypeDefinitions<P>>).map(
        ([propName, propTypeDef]) =>
          typeof propName === 'string' && propTypeDef ? (
            <div key={propName} className={classes.control}>
              <ComponentPropEditor
                name={propName}
                argType={propTypeDef}
                node={node}
                actualValue={actualValues[propName]}
              />
            </div>
          ) : null,
      )}
    </ComponentPropsEditorRoot>
  );
}

interface SelectedNodeEditorProps {
  node: studioDom.StudioElementNode;
}

const DEFAULT_ACTUAL_VALUES = {};

function SelectedNodeEditor({ node }: SelectedNodeEditorProps) {
  const api = useEditorApi();
  const { viewState } = usePageEditorState();
  const actualValues = viewState[node.id]?.props ?? DEFAULT_ACTUAL_VALUES;

  const [nameInput, setNameInput] = React.useState(node.name);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const handleNameCommit = React.useCallback(
    () => api.setNodeName(node.id, nameInput),
    [api, node.id, nameInput],
  );

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        handleNameCommit();
      }
    },
    [handleNameCommit],
  );

  return (
    <React.Fragment>
      <div>{`${node.component} (${node.id})`}</div>
      <TextField
        fullWidth
        size="small"
        label="name"
        value={nameInput}
        onChange={handleNameInputChange}
        onBlur={handleNameCommit}
        onKeyPress={handleKeyPress}
      />
      <div>props:</div>
      {node ? <ComponentPropsEditor node={node} actualValues={actualValues} /> : null}
    </React.Fragment>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const { dom, selection } = usePageEditorState();

  const selectedNode = selection ? studioDom.getNode(dom, selection) : null;

  if (selectedNode) {
    studioDom.assertIsElement(selectedNode);
  }

  return (
    <div className={className}>
      {selectedNode ? (
        // Add key to make sure it mounts every time selected node changes
        <SelectedNodeEditor key={selectedNode.id} node={selectedNode} />
      ) : null}
    </div>
  );
}
