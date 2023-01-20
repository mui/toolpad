import * as React from 'react';
import { Container as MUIContainer, ContainerProps, Button } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

type FormValue = Record<string, string>;

interface Props extends ContainerProps {
  onSubmit: () => void;
  submitLabel: string;
  value: FormValue;
  onChange: (value: FormValue) => void;
}

function Form({ children, onSubmit, onChange, submitLabel, sx, ...props }: Props) {
  const [formState, setFormState] = React.useState<FormValue>({});

  const handleSubmit = () => {
    debugger;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    debugger;
    setFormState({
      ...formState,
      [name]: value,
    });
    onChange(formState);
  };

  return (
    <MUIContainer disableGutters sx={sx} {...props}>
      <form onSubmit={handleSubmit} onChange={handleChange}>
        <MUIContainer />
        {children}

        <MUIContainer
          disableGutters
          sx={{
            borderTop: 'solid 1px',
            display: 'flex',
            justifyContent: 'end',
            width: '100%',
            mt: 1,
            pt: 1,
          }}
        >
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>
        </MUIContainer>
      </form>
    </MUIContainer>
  );
}

export default createComponent(Form, {
  argTypes: {
    children: {
      visible: false,
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    value: {
      helperText: 'The value that is controlled by this text input.',
      typeDef: { type: 'object' },
      onChangeProp: 'onChange',
      defaultValue: {},
    },
    submitLabel: {
      label: 'Submit label',
      helperText: 'Submit button label.',
      typeDef: { type: 'string' },
      defaultValue: 'Submit',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
      defaultValue: { padding: 1 },
    },
  },
});
