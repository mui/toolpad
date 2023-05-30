import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { Controller, FieldError } from 'react-hook-form';
import { FormContext, useFormInput, withComponentForm } from './Form.js';

interface FullFile {
  name: string;
  type: string;
  size: number;
  base64: null | string;
}

export type FilePickerProps = MuiTextFieldProps & {
  multiple: boolean;
  value: FullFile[];
  onChange: (files: FullFile[]) => void;
  name: string;
  isRequired: boolean;
  isInvalid: boolean;
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

function FilePicker({
  multiple,
  value,
  onChange,
  isRequired,
  isInvalid,
  ...rest
}: FilePickerProps) {
  const nodeRuntime = useNode();

  const fieldName = rest.name || nodeRuntime?.nodeName;

  const fallbackName = React.useId();
  const nodeName = fieldName || fallbackName;

  const { form } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const validationProps = React.useMemo(() => ({ isRequired, isInvalid }), [isInvalid, isRequired]);

  const { onFormInputChange } = useFormInput<FullFile[]>({
    name: nodeName,
    value,
    onChange,
    validationProps,
  });

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

    if (form) {
      onFormInputChange(files);
    } else {
      onChange(files);
    }
  };

  const filePickerElement = (
    <MuiTextField
      {...rest}
      type="file"
      value={undefined}
      onChange={handleChange}
      inputProps={{ multiple }}
      InputLabelProps={{ shrink: true }}
      {...(form && {
        error: Boolean(fieldError),
        helperText: (fieldError as FieldError)?.message || '',
      })}
    />
  );

  const fieldDisplayName = rest.label || fieldName || 'Field';

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={{
        required: isRequired ? `${fieldDisplayName} is required.` : false,
        validate: () => !isInvalid || `${fieldDisplayName} is invalid.`,
      }}
      render={() => filePickerElement}
    />
  ) : (
    filePickerElement
  );
}

const FormWrappedFilePicker = withComponentForm(FilePicker);

export default createComponent(FormWrappedFilePicker, {
  helperText: 'File Picker component.\nIt allows users to take select and read files.',
  argTypes: {
    value: {
      type: 'object',
      visible: false,
      onChangeProp: 'onChange',
    },
    label: {
      helperText: 'A label that describes the content of the FilePicker. e.g. "Profile Image".',
      type: 'string',
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      type: 'string',
    },
    multiple: {
      helperText: 'Whether the FilePicker should accept multiple files.',
      type: 'boolean',
      default: true,
    },
    disabled: {
      helperText: 'Whether the FilePicker is disabled.',
      type: 'boolean',
    },
    isRequired: {
      helperText: 'Whether the FilePicker is required to have a value.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the FilePicker value is invalid.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    sx: {
      type: 'object',
    },
  },
});
