import * as React from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  TextField,
} from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';
import {
  FORM_INPUT_ARG_TYPES,
  FormInputComponentProps,
  useFormInput,
  withComponentForm,
} from './Form';

type AutocompleteOption = string | { label?: string; value?: string };
type AutocompleteValue = string | null;

interface AutocompleteProps
  extends Omit<
      MuiAutocompleteProps<AutocompleteOption, false, false, false>,
      'renderInput' | 'value' | 'onChange'
    >,
    Pick<FormInputComponentProps, 'name' | 'isRequired' | 'minLength' | 'maxLength'> {
  value: AutocompleteValue;
  onChange: (newValue: AutocompleteValue) => void;
  label?: string;
  defaultValue: string;
  options: AutocompleteOption[];
}

function Autocomplete({
  options,
  label,
  onChange,
  value,
  defaultValue,
  isRequired,
  minLength,
  maxLength,
  sx,
  ...rest
}: AutocompleteProps) {
  const { onFormInputChange, formInputError, renderFormInput } = useFormInput<string | null>({
    name: rest.name,
    label,
    value,
    onChange,
    emptyValue: null,
    defaultValue,
    validationProps: { isRequired, minLength, maxLength },
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
    },
    [getValue, onFormInputChange],
  );

  return renderFormInput(
    <MuiAutocomplete
      onChange={handleChange}
      options={options ?? []}
      isOptionEqualToValue={(option, selectedValue) => getValue(option) === getValue(selectedValue)}
      getOptionLabel={getOptionLabel}
      value={value}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          {...(formInputError && {
            error: Boolean(formInputError),
            helperText: formInputError.message || '',
          })}
        />
      )}
      sx={{ ...(!rest.fullWidth && !value ? { width: 120 } : {}), ...sx }}
      {...rest}
    />,
  );
}

const FormWrappedAutocomplete = withComponentForm(Autocomplete);

export default createBuiltin(FormWrappedAutocomplete, {
  helperText:
    'A text input with autocomplete suggestions. Uses the Material UI [Autocomplete](https://mui.com/material-ui/react-autocomplete/) under the hood',
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
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value.',
      type: 'string',
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
    ...FORM_INPUT_ARG_TYPES,
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
