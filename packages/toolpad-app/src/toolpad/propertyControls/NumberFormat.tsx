import * as React from 'react';
import { NumberFormat, NumberFormatEditor } from '@mui/toolpad-core/numberFormat';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function GridColumnsPropEditor({
  propType,
  label,
  value,
  onChange,
  disabled,
}: EditorProps<NumberFormat>) {
  return (
    <PropertyControl propType={propType}>
      <NumberFormatEditor label={label} disabled={disabled} value={value} onChange={onChange} />
    </PropertyControl>
  );
}

export default GridColumnsPropEditor;
