import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { Controller, FieldError } from 'react-hook-form';
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

function FilePicker({ multiple, value, onChange, ...rest }: FilePickerProps) {
  const nodeRuntime = useNode();

  const nodeName = rest.name || nodeRuntime?.nodeName;

  const { form, fieldValues, validationRules } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

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

    if (form && nodeName) {
      form.setValue(nodeName, files, { shouldValidate: true, shouldDirty: true });
    } else {
      onChange(files);
    }
  };

  React.useEffect(() => {
    if (fieldValues && nodeName) {
      onChange(fieldValues[nodeName]);
    }
  }, [fieldValues, nodeName, onChange]);

  const filePickerProps = {
    ...rest,
    type: 'file',
    value: undefined,
    onChange: handleChange,
    inputProps: {
      multiple,
    },
    InputLabelProps: { shrink: true },
    ...(form && {
      error: Boolean(fieldError),
      helperText: (fieldError as FieldError)?.message || '',
    }),
  };

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={validationRules[nodeName]}
      render={() => <MuiTextField {...filePickerProps} />}
    />
  ) : (
    <MuiTextField {...filePickerProps} />
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
