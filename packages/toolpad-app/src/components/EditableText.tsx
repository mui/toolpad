import * as React from 'react';
import {
  Skeleton,
  TextField,
  Typography,
  TypographyVariant,
  Tooltip,
  SxProps,
} from '@mui/material';

interface EditableTextProps {
  defaultValue?: string;
  loading: boolean;
  editing: boolean;
  isError: boolean;
  errorText?: string;
  onKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  variant?: TypographyVariant;
  size?: 'small' | 'medium';
  inputProps?: SxProps;
  sx?: SxProps;
}

const EditableText = React.forwardRef<HTMLInputElement, EditableTextProps>(
  (
    {
      defaultValue,
      onKeyUp,
      onBlur,
      variant,
      size,
      sx,
      inputProps,
      editing,
      loading,
      isError,
      errorText,
    },
    ref,
  ) => {
    return editing ? (
      <TextField
        variant={'standard'}
        size={size ?? 'small'}
        inputRef={ref}
        sx={sx}
        InputProps={{ sx: inputProps }}
        onKeyUp={onKeyUp ?? (() => {})}
        onBlur={onBlur ?? (() => {})}
        defaultValue={defaultValue}
        error={isError}
        helperText={isError ? errorText : ''}
      />
    ) : (
      <Tooltip title={defaultValue || ''} enterDelay={500} placement={'left'}>
        <Typography gutterBottom variant={variant ?? 'body1'} component="div" noWrap>
          {loading ? <Skeleton /> : defaultValue}
        </Typography>
      </Tooltip>
    );
  },
);

export default EditableText;
