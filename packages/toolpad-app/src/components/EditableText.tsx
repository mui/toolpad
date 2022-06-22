import * as React from 'react';
import { Skeleton, TextField, Typography, TypographyVariant } from '@mui/material';

interface EditableTextProps {
  defaultValue?: string;
  loading: boolean;
  editing: boolean;
  onKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  variant?: TypographyVariant;
  size?: 'small' | 'medium';
}

const EditableText = React.forwardRef<HTMLInputElement, EditableTextProps>(
  ({ defaultValue, onKeyUp, onBlur, variant, size, editing, loading }, ref) => {
    return editing ? (
      <TextField
        variant={'standard'}
        size={size ?? 'small'}
        inputRef={ref}
        sx={{ paddingBottom: '4px' }}
        InputProps={{ sx: { fontSize: '1.5rem', height: '1.5em' } }}
        onKeyUp={onKeyUp ?? (() => {})}
        onBlur={onBlur ?? (() => {})}
        defaultValue={defaultValue}
      />
    ) : (
      <Typography gutterBottom variant={variant ?? 'body1'} component="div">
        {loading ? <Skeleton /> : defaultValue}
      </Typography>
    );
  },
);

export default EditableText;
