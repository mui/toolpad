import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

interface FullFile {
  name: string;
  type: string;
  size: number;
  base64: null | string;
}

export type Props = MuiTextFieldProps & {
  multiple: boolean;
  onChange: (files: FullFile[]) => void;
};

const readFile = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const readerBase64 = new FileReader();

    readerBase64.onload = (event) => {
      if (!event.target) {
        reject();
        return;
      }

      resolve(event.target.result as string);
    };

    readerBase64.readAsDataURL(file);
  });
};

function FilePicker({ multiple, onChange, ...props }: Props) {
  const handleChange = async (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const filesPromises = Array.from(changeEvent.target.files || []).map(async (file) => {
      const fullFile: FullFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64: await readFile(file),
      };

      return fullFile;
    });

    const files = await Promise.all(filesPromises);

    onChange(files);
  };

  return (
    <MuiTextField
      {...props}
      type="file"
      value={undefined}
      inputProps={{ multiple }}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
    />
  );
}

export default createComponent(FilePicker, {
  helperText: 'File picker component.\nIt allows users to take select and read files.',
  argTypes: {
    value: {
      typeDef: { type: 'object' },
      visible: false,
      onChangeProp: 'onChange',
    },
    label: {
      helperText: 'A label that describes the content of the FilePicker. e.g. "Profile Image".',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-text-field/#basic-textfield). Possible values are `outlined`, `filled` or `standard`.',
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      helperText: 'The size of the component. One of `small` or `normal`.',
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    multiple: {
      helperText: 'Whether the FilePicker should accept multiple files.',
      typeDef: { type: 'boolean' },
      defaultValue: true,
    },
    fullWidth: {
      helperText: 'Whether the FilePicker should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the FilePicker is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
