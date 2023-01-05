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
      helperText: '',
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
      helperText:
        'The [format](https://day.js.org/docs/en/display/format) of the date in the UI. The value for the bindings will always be in the `YYYY-MM-DD` format. Leave empty to let the end-user locale define the format.',
      typeDef: {
        type: 'string',
      },
      defaultValue: '',
    },
    // @ts-ignore no idea why it complains even though it's done exactly same as TextField
    defaultValue: {
      helperText: 'A default value for the date picker.',
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    label: {
      helperText: 'A label that describes the content of the date picker. e.g. "Arrival date".',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      helperText: 'The size of the component. One of `small`, or `medium`.',
      typeDef: { type: 'string', enum: ['small', 'medium'] },
      defaultValue: 'small',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'The date picker is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
