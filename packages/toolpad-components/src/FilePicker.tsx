import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import * as _ from 'lodash-es';
import { FORM_INPUT_VALIDATION_ARG_TYPES, FormInputValidationProps, useFormInput } from './Form.js';

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
} & Pick<FormInputValidationProps, 'isRequired' | 'isInvalid'>;

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
  const { onFormInputChange, formInputError, renderFormInput } = useFormInput<FullFile[]>({
    name: rest.name,
    label: rest.label as string,
    value,
    onChange,
    validationProps: { isRequired, isInvalid },
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

    onFormInputChange(files);
  };

  return renderFormInput(
    <MuiTextField
      {...rest}
      type="file"
      value={undefined}
      onChange={handleChange}
      inputProps={{ multiple }}
      InputLabelProps={{ shrink: true }}
      {...(formInputError && {
        error: Boolean(formInputError),
        helperText: formInputError.message || '',
      })}
    />,
  );
}

export default createComponent(FilePicker, {
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
    ..._.pick(FORM_INPUT_VALIDATION_ARG_TYPES, ['isRequired', 'isInvalid']),
    sx: {
      type: 'object',
    },
  },
});
