import { Alert, IconButton, Stack, styled, TextField } from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { PropDefinition, PropDefinitions } from '@mui/studio-core';
import { getStudioComponent } from '../../studioComponents';
import { StudioNode } from '../../types';
import { getNode } from '../../studioPage';
import propTypes from '../../studioPropTypes';
import { useEditorApi, useEditorState } from './EditorProvider';
import { ExactEntriesOf } from '../../utils/types';

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
  node: StudioNode<P>;
  prop: PropDefinition<K, P>;
}

function ComponentPropEditor<P, K extends keyof P & string>({
  name,
  node,
  prop,
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

  const propTypeDef = propTypes[prop.type];

  const propValue = node.props[name];

  const initPropValue = React.useCallback(() => {
    if (propValue?.type === 'const') {
      return propValue.value;
    }
    return prop.defaultValue;
  }, [prop.defaultValue, propValue]);

  const [value, setValue] = React.useState(initPropValue);

  React.useEffect(() => {
    setValue(initPropValue());
    return () => {};
  }, [propValue, initPropValue]);

  const hasBinding = propValue?.type === 'binding';

  return (
    <Stack direction="row" alignItems="flex-start">
      {propTypeDef ? (
        <React.Fragment>
          <propTypeDef.Editor
            name={name}
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
          Unknown type &quot;{prop.type}&quot; for property &quot;{name}&quot;
        </Alert>
      )}
    </Stack>
  );
}

interface ComponentPropsEditorProps<P> {
  node: StudioNode<P>;
}

function ComponentPropsEditor<P>({ node }: ComponentPropsEditorProps<P>) {
  const definition = getStudioComponent(node.component);

  return (
    <ComponentPropsEditorRoot>
      {(Object.entries(definition.props) as ExactEntriesOf<PropDefinitions<P>>).map(
        ([propName, prop]) =>
          typeof propName === 'string' && prop ? (
            <div key={propName} className={classes.control}>
              <ComponentPropEditor name={propName} prop={prop} node={node} />
            </div>
          ) : null,
      )}
    </ComponentPropsEditorRoot>
  );
}

interface SelectedNodeEditorProps {
  node: StudioNode;
}

function SelectedNodeEditor({ node }: SelectedNodeEditorProps) {
  const api = useEditorApi();

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
      {node ? <ComponentPropsEditor node={node} /> : null}
    </React.Fragment>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const state = useEditorState();

  const selectedNode = state.selection ? getNode(state.page, state.selection) : null;

  return (
    <div className={className}>
      {selectedNode ? (
        // Add key to make sure it mounts every time selected node changes
        <SelectedNodeEditor key={selectedNode.id} node={selectedNode} />
      ) : null}
    </div>
  );
}
