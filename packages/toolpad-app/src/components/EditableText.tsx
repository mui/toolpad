import * as React from 'react';
import {
  TextField,
  Theme,
  TypographyVariant,
  SxProps,
  inputBaseClasses,
  inputClasses,
} from '@mui/material';
import invariant from 'invariant';

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

    const readOnly = React.useMemo(() => disabled || !editable, [disabled, editable]);

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
        invariant(!readOnly, 'Readonly input should be disabled');
        if (onChange) {
          onChange(event.target.value);
        }
      },
      [readOnly, onChange],
    );

    const handleInput = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        invariant(!readOnly, 'Readonly input should be disabled');
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
      [readOnly, defaultValue, onChange, onSave, onClose],
    );

    return (
      <TextField
        error={error}
        helperText={helperText}
        ref={ref}
        onDoubleClick={onDoubleClick}
        inputRef={appTitleInput}
        inputProps={{
          readOnly,
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
          transition: (theme: Theme) =>
            theme.transitions.create(['border-bottom'], {
              duration: theme.transitions.duration.short,
            }),
          [`.${inputClasses.root}.${inputBaseClasses.root}:before, .${inputClasses.root}.${inputBaseClasses.root}:not(${inputBaseClasses.disabled}):hover:before`]:
            {
              borderBottom: editable ? `initial` : 'none',
            },
          [`& .${inputClasses.root}.${inputBaseClasses.root}::after`]: readOnly
            ? {
                transform: 'scaleX(0)',
                borderBottom: 'none',
                transition: (theme: Theme) =>
                  theme.transitions.create(['transform'], {
                    duration: theme.transitions.duration.short,
                  }),
              }
            : {
                transform: 'scaleX(1)',
                borderBottom: '2px solid primary',
              },
        }}
        value={value}
        variant={'standard'}
      />
    );
  },
);

export default EditableText;
