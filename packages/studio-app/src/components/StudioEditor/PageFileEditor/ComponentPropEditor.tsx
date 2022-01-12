import { Alert, IconButton, Stack } from '@mui/material';
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/studio-core';
import studioPropControls from '../../propertyControls';
import { useEditorApi } from '../EditorProvider';
import * as studioDom from '../../../studioDom';

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
    case 'dataQuery':
      return { type: 'dataQuery' };
    default:
      return null;
  }
}

export interface ComponentPropEditorProps<P, K extends keyof P> {
  name: K;
  node: studioDom.StudioElementNode<P>;
  argType: ArgTypeDefinition;
  actualValue: unknown;
}

export default function ComponentPropEditor<P, K extends keyof P & string>({
  name,
  node,
  argType,
  actualValue,
}: ComponentPropEditorProps<P, K>) {
  const api = useEditorApi();

  const handleChange = React.useCallback(
    (value: any) => api.dom.setNodeConstPropValue(node, name, value),
    [api, node, name],
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
          {`No control for property '${name}' (type '${argType.typeDef.type}' ${
            argType.control ? `, control: '${argType.control.type}'` : ''
          })`}
        </Alert>
      )}
    </Stack>
  );
}
