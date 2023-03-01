import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FormContext } from './Form';

interface FullFile {
  name: string;
  type: string;
  size: number;
  base64: null | string;
}

export type FilePickerProps = MuiTextFieldProps & {
  multiple: boolean;
  onChange: (files: FullFile[]) => void;
  name: string;
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

function FilePicker({ multiple, onChange, ...rest }: FilePickerProps) {
  const nodeRuntime = useNode();

  const { form, validationRules } = React.useContext(FormContext);

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

  const nodeName = rest.name || nodeRuntime?.nodeName;

  return (
    <MuiTextField
      {...rest}
      type="file"
      value={undefined}
      inputProps={{
        multiple,
        ...(form && nodeName && form.register(nodeName, validationRules[nodeName])),
      }}
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
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      typeDef: { type: 'string' },
    },
    multiple: {
      helperText: 'Whether the FilePicker should accept multiple files.',
      typeDef: { type: 'boolean', default: true },
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
