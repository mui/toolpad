import * as React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

interface FullFile {
  name: string;
  type: string;
  size: number;
  base64: null | string;
}

interface Props
  extends Pick<ButtonProps, 'variant' | 'size' | 'color' | 'fullWidth' | 'disabled' | 'sx'> {
  multiple: boolean;
  content: string;
  value: any;
  onChange: (files: FullFile[]) => void;
}

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

function FilePicker({ multiple, onChange, content, ...props }: Props) {
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
    <MuiButton {...props} component="label">
      {content}
      <input type="file" hidden onChange={handleChange} multiple={multiple} />
    </MuiButton>
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
    multiple: {
      helperText: 'Whether the FilePicker should accept multiple files.',
      typeDef: { type: 'boolean' },
      defaultValue: true,
    },
    content: {
      helperText: 'Will appear as the text content of the button.',
      typeDef: { type: 'string' },
      defaultValue: 'Select files',
    },
    variant: {
      helperText:
        'One of the available MUI Button [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `contained`, `outlined` or `text`',
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      defaultValue: 'contained',
    },
    size: {
      helperText: 'The size of the component. One of `small`, `medium`, or `large`.',
      typeDef: { type: 'string', enum: ['small', 'medium', 'large'] },
      defaultValue: 'medium',
    },
    color: {
      helperText: 'The theme color of the component.',
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
      defaultValue: 'primary',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the button is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
