import * as React from 'react';
import {
  TextField,
  Theme,
  TypographyVariant,
  SxProps,
  inputBaseClasses,
  formHelperTextClasses,
  inputClasses,
} from '@mui/material';

interface EditableTextProps {
  defaultValue?: string;
  disabled?: boolean;
  editable?: boolean;
  helperText?: React.ReactNode;
  error?: boolean;
  onChange?: (newValue: string) => void;
  onSave?: (newValue: string) => void;
  onClose?: () => void;
  onDoubleClick?: () => void;
  size?: 'small' | 'medium';
  sx?: SxProps;
  value?: string;
  variant?: TypographyVariant;
}

const EditableText = React.forwardRef<HTMLInputElement, EditableTextProps>(
  (
    {
      defaultValue,
      disabled,
      editable,
      helperText,
      error,
      onChange,
      onClose,
      onDoubleClick,
      onSave,
      size,
      sx,
      value,
      variant: typographyVariant = 'body1',
    },
    ref,
  ) => {
    const appTitleInput = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      const inputElement = appTitleInput.current;
      if (inputElement) {
        if (editable) {
          inputElement.focus();
          inputElement.select();
        } else {
          inputElement.blur();
        }
      }
    }, [ref, editable]);

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        // This is only triggered on a click away
        if (onClose) {
          onClose();
        }
        if (onSave && event.target) {
          onSave(event.target.value);
        }
      },
      [onClose, onSave],
    );

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          onChange(event.target.value);
        }
      },
      [onChange],
    );

    const handleInput = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        const inputElement = appTitleInput.current;
        if (inputElement) {
          if (event.key === 'Escape') {
            if (defaultValue) {
              if (onChange) {
                onChange(defaultValue);
              }
            }
            if (onClose) {
              onClose();
            }
            return;
          }
          if (event.key === 'Enter') {
            if (onClose) {
              onClose();
            }
            if (onSave) {
              onSave((event.target as HTMLInputElement).value);
            }
          }
        }
      },
      [defaultValue, onChange, onSave, onClose],
    );

    return (
      <TextField
        // `disabled` prop overrides `editable` prop
        disabled={disabled || !editable}
        error={error}
        helperText={helperText}
        ref={ref}
        onDoubleClick={onDoubleClick}
        inputRef={appTitleInput}
        inputProps={{
          // tabIndex: editable ? 0 : -1,
          'aria-readonly': !editable,
          sx: (theme: Theme) => ({
            // Handle overflow
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: theme.typography[typographyVariant].fontSize,
            height: theme.typography.pxToRem(8),
            cursor: 'pointer',
          }),
        }}
        onKeyUp={handleInput}
        onBlur={handleBlur}
        onChange={handleChange}
        size={size ?? 'small'}
        sx={{
          ...sx,
          [`.${inputClasses.root}.${inputBaseClasses.root}:before, .${inputClasses.root}.${inputBaseClasses.root}:not(${inputBaseClasses.disabled}):hover:before`]:
            {
              borderBottom: editable ? `initial` : 'none',
            },
          // TextField must not appear disabled if disabled state is controlled by `editable` prop
          [`.${inputClasses.root}.${inputBaseClasses.root}.${inputBaseClasses.disabled}, .${inputClasses.input}.${inputBaseClasses.input}.${inputBaseClasses.disabled}, .${formHelperTextClasses.root}.${inputBaseClasses.disabled}`]:
            disabled
              ? null
              : {
                  WebkitTextFillColor: 'unset',
                  color: 'unset',
                },
        }}
        value={value}
        variant={'standard'}
      />
    );
  },
);

export default EditableText;
