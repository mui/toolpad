import * as React from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  TextField,
} from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError, Controller } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants.js';
import { FormContext, useFormInput, withComponentForm } from './Form.js';

type AutocompleteOption = string | { label?: string; value?: string };
type AutocompleteValue = string | null;

interface AutocompleteProps
  extends Omit<
    MuiAutocompleteProps<AutocompleteOption, false, false, false>,
    'renderInput' | 'value' | 'onChange'
  > {
  value: AutocompleteValue;
  onChange: (newValue: AutocompleteValue) => void;
  options: AutocompleteOption[];
  label: string;
  name: string;
  isRequired: boolean;
  minLength: number;
  maxLength: number;
  isInvalid: boolean;
}

function Autocomplete({
  options,
  label,
  onChange,
  value,
  isRequired,
  minLength,
  maxLength,
  isInvalid,
  ...rest
}: AutocompleteProps) {
  const [selectedVal, setSelectedVal] = React.useState<AutocompleteOption | null>(null);

  const nodeRuntime = useNode();

  const fieldName = rest.name || nodeRuntime?.nodeName;

  const fallbackName = React.useId();
  const nodeName = fieldName || fallbackName;

  const { form } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const validationProps = React.useMemo(
    () => ({ isRequired, minLength, maxLength, isInvalid }),
    [isInvalid, isRequired, maxLength, minLength],
  );

  const { onFormInputChange } = useFormInput<string | null>({
    name: nodeName,
    value,
    onChange,
    emptyValue: null,
    validationProps,
  });

  const getValue = React.useCallback((selection: AutocompleteOption | null): AutocompleteValue => {
    if (!selection) {
      return null;
    }
    if (typeof selection === 'string') {
      return selection;
    }
    if (typeof selection === 'object') {
      return selection?.value ?? selection?.label ?? null;
    }
    return null;
  }, []);

  const getOptionLabel = React.useCallback((option: AutocompleteOption) => {
    if (!option) {
      return '';
    }
    if (typeof option === 'string') {
      return option;
    }
    if (typeof option === 'object') {
      return option?.label ?? '';
    }
    return '';
  }, []);

  const handleChange = React.useCallback(
    (event: React.SyntheticEvent<Element>, selection: AutocompleteOption | null) => {
      const newValue: AutocompleteValue = getValue(selection);

      if (form) {
        onFormInputChange(newValue);
      } else {
        onChange(newValue);
      }

      setSelectedVal(selection);
    },
    [getValue, form, onFormInputChange, onChange],
  );

  React.useEffect(() => {
    if (!value) {
      setSelectedVal(null);
    }
  }, [value]);

  const autocompleteElement = (
    <MuiAutocomplete
      onChange={handleChange}
      options={options ?? []}
      isOptionEqualToValue={(option, selectedValue) => getValue(option) === getValue(selectedValue)}
      getOptionLabel={getOptionLabel}
      value={selectedVal}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      {...rest}
      {...(form && {
        error: Boolean(fieldError),
        helperText: (fieldError as FieldError)?.message || '',
      })}
    />
  );

  const fieldDisplayName = label || fieldName || 'Field';

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={{
        required: isRequired ? `${fieldDisplayName} is required.` : false,
        minLength: minLength
          ? {
              value: minLength,
              message: `${fieldDisplayName} must have at least ${minLength} characters.`,
            }
          : undefined,
        maxLength: maxLength
          ? {
              value: maxLength,
              message: `${fieldDisplayName} must have no more than ${maxLength} characters.`,
            }
          : undefined,
        validate: () => !isInvalid || `${fieldDisplayName} is invalid.`,
      }}
      render={() => autocompleteElement}
    />
  ) : (
    autocompleteElement
  );
}

const FormWrappedAutocomplete = withComponentForm(Autocomplete);

export default createComponent(FormWrappedAutocomplete, {
  layoutDirection: 'both',
  loadingProp: 'loading',
  argTypes: {
    options: {
      helperText: 'The options available to search from.',
      type: 'array',
      default: [],
      control: {
        type: 'SelectOptions',
      },
    },
    value: {
      helperText: 'The value of the autocomplete.',
      type: 'string',
      onChangeProp: 'onChange',
      default: '',
    },
    label: {
      helperText: 'The label to display for the autocomplete.',
      type: 'string',
      default: 'Search…',
    },
    fullWidth: {
      helperText: 'If true, the autocomplete will take up the full width of its container.',
      type: 'boolean',
      default: true,
    },
    size: {
      helperText: 'The size of the autocomplete. One of `small`, `medium`, or `large`.',
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'small',
    },
    loading: {
      helperText: 'If true, the autocomplete will display a loading indicator.',
      type: 'boolean',
    },
    disabled: {
      helperText: 'If true, the autocomplete will be disabled.',
      type: 'boolean',
    },
    isRequired: {
      helperText: 'Whether the input is required to have a value.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    minLength: {
      helperText: 'Minimum value length.',
      type: 'number',
      minimum: 0,
      maximum: 512,
      default: 0,
      category: 'validation',
    },
    maxLength: {
      helperText: 'Maximum value length.',
      type: 'number',
      minimum: 0,
      maximum: 512,
      default: 0,
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the input value is invalid.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
