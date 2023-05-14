import * as React from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  TextField,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

type AutocompleteOption = string | { label?: string };

interface AutocompleteProps
  extends Omit<MuiAutocompleteProps<AutocompleteOption, false, false, false>, 'renderInput'> {
  options: AutocompleteOption[];
  label: string;
}

function Autocomplete({ options, label, ...rest }: AutocompleteProps) {
  return (
    <MuiAutocomplete
      options={options ?? []}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      {...rest}
    />
  );
}

export default createComponent(Autocomplete, {
  layoutDirection: 'both',
  argTypes: {
    options: {
      type: 'array',
      default: [],
    },
    label: {
      type: 'string',
      default: 'Search…',
    },
    value: {
      type: 'string',
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.textContent,
      default: '',
    },
    fullWidth: {
      type: 'boolean',
      default: true,
    },
    size: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'small',
    },
    loading: {
      type: 'boolean',
    },
    disabled: {
      type: 'boolean',
    },
    sx: {
      type: 'object',
    },
  },
});
