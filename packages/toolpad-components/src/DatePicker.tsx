import * as React from 'react';

import { TextField } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createComponent } from '@mui/toolpad-core';
import { Dayjs } from 'dayjs';

export interface Props extends DesktopDatePickerProps<string, Dayjs> {
  format: string;
  separator: string;
  fullWidth: boolean;
  variant: 'outlined' | 'filled' | 'standard';
  size: 'small' | 'medium';
  sx: any;
}

const resolveFormat = (format: string, separator: string) => format.replaceAll(' ', separator);

function DatePicker(props: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs as any}>
      <DesktopDatePicker
        inputFormat={resolveFormat(props.format, props.separator)}
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
  argTypes: {
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (newValue: Dayjs, { format, separator }: Props) => {
        return newValue.format(resolveFormat(format, separator));
      },
      defaultValue: '',
      defaultValueProp: 'defaultValue',
    },
    format: {
      typeDef: {
        type: 'string',
        enum: ['DD MM YYYY', 'YYYY MM DD', 'MM DD YYYY'],
      },
      defaultValue: 'YYYY MM DD',
    },
    separator: {
      typeDef: {
        type: 'string',
        enum: ['-', '/', ' '],
      },
      defaultValue: '-',
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
      typeDef: { type: 'boolean' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
