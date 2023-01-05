import * as React from 'react';

import { TextField } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createComponent } from '@mui/toolpad-core';
import { Dayjs } from 'dayjs';
import { SX_PROP_HELPER_TEXT } from './constants';

export interface Props extends DesktopDatePickerProps<string, Dayjs> {
  format: string;
  fullWidth: boolean;
  variant: 'outlined' | 'filled' | 'standard';
  size: 'small' | 'medium';
  sx: any;
}

function DatePicker(props: Props) {
  const customProps: any = {};

  if (props.format) {
    // If inputFormat receives undefined prop, datepicker throws error
    customProps.inputFormat = props.format;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs as any}>
      <DesktopDatePicker
        {...customProps}
        {...props}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth={props.fullWidth}
            variant={props.variant}
            size={props.size}
            sx={props.sx}
          />
        )}
      />
    </LocalizationProvider>
  );
}

export default createComponent(DatePicker, {
  helperText:
    'The MUI X [Date picker](https://mui.com/x/react-data-grid/) component.\n\nThe date picker lets the user select a date.',
  argTypes: {
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (newValue: Dayjs) => {
        // date-only form of ISO8601. See https://tc39.es/ecma262/#sec-date-time-string-format
        return newValue.format('YYYY-MM-DD');
      },
      defaultValue: '',
      defaultValueProp: 'defaultValue',
    },
    format: {
      typeDef: {
        type: 'string',
      },
      defaultValue: '',
    },
    // @ts-ignore no idea why it complains even though it's done exactly same as TextField
    defaultValue: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'medium'] },
      defaultValue: 'small',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
