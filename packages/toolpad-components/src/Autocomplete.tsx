import * as React from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  TextField,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { FieldError, Controller } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants.js';
import { useFormInput, withComponentForm } from './Form.js';

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

  const validationProps = React.useMemo(
    () => ({ isRequired, minLength, maxLength, isInvalid }),
    [isInvalid, isRequired, maxLength, minLength],
  );

  const { form, formInputName, formInputDisplayName, onFormInputChange, fieldError } = useFormInput<
    string | null
  >({
    name: rest.name,
    label,
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
      onFormInputChange(newValue);
      setSelectedVal(selection);
    },
    [getValue, onFormInputChange],
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

  return form ? (
    <Controller
      name={formInputName}
      control={form.control}
      rules={{
        required: isRequired ? `${formInputDisplayName} is required.` : false,
        minLength: minLength
          ? {
              value: minLength,
              message: `${formInputDisplayName} must have at least ${minLength} characters.`,
            }
          : undefined,
        maxLength: maxLength
          ? {
              value: maxLength,
              message: `${formInputDisplayName} must have no more than ${maxLength} characters.`,
            }
          : undefined,
        validate: () => !isInvalid || `${formInputDisplayName} is invalid.`,
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
