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
    />
  );
}

export default createComponent(FilePicker, {
  argTypes: {
    value: {
      typeDef: { type: 'file' },
      onChangeProp: 'onChange',
    },
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    multiple: {
      typeDef: { type: 'boolean' },
      defaultValue: true,
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
