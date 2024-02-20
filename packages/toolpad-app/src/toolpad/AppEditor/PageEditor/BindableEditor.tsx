import {
  Stack,
  SxProps,
  inputBaseClasses,
  formLabelClasses,
  typographyClasses,
} from '@mui/material';
import * as React from 'react';
import {
  BindableAttrValue,
  PropValueType,
  LiveBinding,
  JsRuntime,
  ScopeMeta,
  EnvAttrValue,
} from '@mui/toolpad-core';
import { WithControlledProp } from '@mui/toolpad-utils/types';
import { getBindingType } from '../../../runtime/bindings';
import { getDefaultControl, usePropControlsContext } from '../../propertyControls';

// eslint-disable-next-line import/no-cycle
import { BindingEditor } from '../BindingEditor';

export interface RenderControlParams<V> extends WithControlledProp<V> {
  label: string;
  propType: PropValueType;
  disabled: boolean;
}

export interface BindableEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  label: string;
  bindable?: boolean;
  disabled?: boolean;
  jsRuntime: JsRuntime;
  propType: PropValueType;
  renderControl?: (params: RenderControlParams<any>) => React.ReactNode;
  liveBinding?: LiveBinding;
  globalScope?: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
  env?: Record<string, string>;
  sx?: SxProps;
}

export default function BindableEditor<V>({
  label,
  bindable = true,
  disabled,
  propType,
  renderControl: renderControlProp,
  value,
  jsRuntime,
  onChange,
  liveBinding,
  globalScope = {},
  globalScopeMeta = {},
  env,
  sx,
}: BindableEditorProps<V>) {
  const propTypeControls = usePropControlsContext();

  const renderDefaultControl = React.useCallback(
    (params: RenderControlParams<any>) => {
      const Control = getDefaultControl(propTypeControls, params.propType);
      return Control ? <Control {...params} /> : null;
    },
    [propTypeControls],
  );

  const renderControl = renderControlProp || renderDefaultControl;

  const handlePropConstChange = React.useCallback((newValue: V) => onChange(newValue), [onChange]);

  const valueBindingType = value && getBindingType(value);

  const initConstValue = React.useCallback(() => {
    if (valueBindingType && valueBindingType === 'const') {
      return value;
    }

    if (valueBindingType && valueBindingType === 'env') {
      return (value as EnvAttrValue).$$env;
    }

    return liveBinding?.value;
  }, [liveBinding, value, valueBindingType]);

  const constValue = React.useMemo(initConstValue, [value, initConstValue]);

  const hasBinding = value && valueBindingType !== 'const';

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        [`& .${inputBaseClasses.root}`]: { fontSize: 12 },
        [`& .${formLabelClasses.root}`]: { fontSize: 12 },
        [`& .${typographyClasses.root}`]: { fontSize: 12 },
        ...sx,
      }}
    >
      <React.Fragment>
        {renderControl({
          label,
          propType,
          disabled: disabled || !!hasBinding,
          value: constValue,
          onChange: handlePropConstChange,
        })}
        <BindingEditor<V>
          globalScope={globalScope}
          globalScopeMeta={globalScopeMeta}
          label={label}
          jsRuntime={jsRuntime}
          propType={propType}
          value={value}
          onChange={onChange}
          disabled={disabled || !bindable}
          hidden={!bindable}
          liveBinding={liveBinding}
          env={env}
        />
      </React.Fragment>
    </Stack>
  );
}
