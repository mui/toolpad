import { Stack, SxProps } from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, PropValueType, LiveBinding } from '@mui/toolpad-core';
import { BindingEditor } from '../BindingEditor';
import { WithControlledProp } from '../../../utils/types';
import { getDefaultControl } from '../../propertyControls';

function renderDefaultControl(params: RenderControlParams<any>) {
  const Control = getDefaultControl({ typeDef: params.propType });
  return Control ? <Control {...params} /> : null;
}

export interface RenderControlParams<V> extends WithControlledProp<V> {
  label: string;
  propType: PropValueType;
  disabled: boolean;
  minValue?: number;
  maxValue?: number;
}

export interface BindableEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  label: string;
  disabled?: boolean;
  server?: boolean;
  propType: PropValueType;
  minValue?: number;
  maxValue?: number;
  renderControl?: (params: RenderControlParams<any>) => React.ReactNode;
  liveBinding?: LiveBinding;
  globalScope?: Record<string, unknown>;
  sx?: SxProps;
}

export default function BindableEditor<V>({
  label,
  disabled,
  propType,
  renderControl = renderDefaultControl,
  value,
  minValue,
  maxValue,
  server,
  onChange,
  liveBinding,
  globalScope = {},
  sx,
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
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={sx}>
      <React.Fragment>
        {renderControl({
          label,
          propType,
          disabled: disabled || !!hasBinding,
          value: constValue,
          onChange: handlePropConstChange,
          minValue,
          maxValue,
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
