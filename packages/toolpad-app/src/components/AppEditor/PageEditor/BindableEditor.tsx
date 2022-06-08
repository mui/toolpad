import { Stack, TextField } from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, PropValueType, LiveBinding } from '@mui/toolpad-core';
import { BindingEditor } from '../BindingEditor';
import { WithControlledProp } from '../../../utils/types';

function DefaultControl({ label, disabled, value, onChange }: RenderControlParams<any>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <TextField
      fullWidth
      value={value ?? ''}
      disabled={disabled}
      onChange={handleChange}
      label={label}
    />
  );
}

function renderDefaultControl(params: RenderControlParams<any>) {
  return <DefaultControl {...params} />;
}

export interface RenderControlParams<V> extends WithControlledProp<V> {
  label: string;
  disabled: boolean;
}

export interface BindableEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  label: string;
  disabled?: boolean;
  server?: boolean;
  propType: PropValueType;
  renderControl?: (params: RenderControlParams<any>) => React.ReactNode;
  liveBinding?: LiveBinding;
  globalScope?: Record<string, unknown>;
}

export default function BindableEditor<V>({
  label,
  disabled,
  propType,
  renderControl = renderDefaultControl,
  value,
  server,
  onChange,
  liveBinding,
  globalScope = {},
}: BindableEditorProps<V>) {
  const handlePropConstChange = React.useCallback(
    (newValue: V) => onChange({ type: 'const', value: newValue }),
    [onChange],
  );

  const initConstValue = React.useCallback(() => {
    if (value?.type === 'const') {
      return value.value;
    }

    return liveBinding?.value;
  }, [liveBinding, value]);

  const constValue = React.useMemo(initConstValue, [value, initConstValue]);

  const hasBinding = value && value.type !== 'const';

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <React.Fragment>
        {renderControl({
          label,
          disabled: !!hasBinding,
          value: constValue,
          onChange: handlePropConstChange,
        })}
        <BindingEditor<V>
          globalScope={globalScope}
          label={label}
          server={server}
          propType={propType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          liveBinding={liveBinding}
        />
      </React.Fragment>
    </Stack>
  );
}
