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
      typeDef: { type: 'array' },
      defaultValue: [],
    },
    label: {
      typeDef: { type: 'string' },
      defaultValue: 'Search…',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.textContent,
      defaultValue: '',
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
      defaultValue: true,
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'medium', 'large'] },
      defaultValue: 'small',
    },
    loading: {
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
