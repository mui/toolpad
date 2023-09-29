import * as React from 'react';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view';
import { Alert, InputBase, InputBaseProps, Popover, alpha, useTheme } from '@mui/material';

export interface EditableTreeItemProps extends TreeItemProps {
  suggestedNewItemName?: string;
  isEditing?: boolean;
  onEdit?: (newItemName: string) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  validateItemName?: (newItemName: string) => { isValid: boolean; errorMessage?: string };
  inputProps?: Omit<
    InputBaseProps,
    'value' | 'onChange' | 'autoFocus' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'fullWidth'
  >;
}

export default function EditableTreeItem({
  suggestedNewItemName = '',
  validateItemName,
  isEditing: isExternalEditing = false,
  onEdit,
  onCancel,
  inputProps,
  sx,
  ...rest
}: EditableTreeItemProps) {
  const theme = useTheme();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [itemNameInput, setItemNameInput] = React.useState(suggestedNewItemName);
  const [isInternalEditing, setIsInternalEditing] = React.useState(false);

  const isEditing = isExternalEditing || isInternalEditing;

  const newItemValidationResult = React.useMemo(
    () => (validateItemName ? validateItemName(itemNameInput) : { isValid: true }),
    [itemNameInput, validateItemName],
  );
  const validationErrorMessage = newItemValidationResult.errorMessage;

  React.useEffect(() => {
    setItemNameInput(suggestedNewItemName);
  }, [suggestedNewItemName]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      // Double-click
      if (event.detail === 2 && onEdit) {
        setIsInternalEditing(true);
      }
    },
    [onEdit],
  );

  const handleCancel = React.useCallback(() => {
    setItemNameInput(suggestedNewItemName);
    setIsInternalEditing(false);

    if (onCancel) {
      onCancel();
    }
  }, [onCancel, suggestedNewItemName]);

  const handleConfirm = React.useCallback(() => {
    if (!itemNameInput || !newItemValidationResult.isValid) {
      handleCancel();
      return;
    }

    if (onEdit) {
      onEdit(itemNameInput);
    }

    setItemNameInput('');
    setIsInternalEditing(false);
  }, [handleCancel, itemNameInput, newItemValidationResult.isValid, onEdit]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setItemNameInput(event.target.value);
  }, []);

  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (!suggestedNewItemName || (event && event.target.value !== suggestedNewItemName)) {
        handleConfirm();
      } else {
        handleCancel();
      }
    },
    [handleCancel, handleConfirm, suggestedNewItemName],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleConfirm();
      } else if (event.key === 'Escape') {
        handleCancel();
        event.stopPropagation();
      }
    },
    [handleCancel, handleConfirm],
  );

  const inputErrorPopoverAnchorEl = inputRef.current;

  return (
    <TreeItem
      {...rest}
      onClick={handleClick}
      label={
        isEditing ? (
          <React.Fragment>
            <InputBase
              {...inputProps}
              ref={inputRef}
              value={itemNameInput}
              onChange={handleChange}
              autoFocus
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={{
                fontSize: 14,
                paddingBottom: '1px',
                ...(inputProps?.sx ?? {}),
              }}
            />
            {inputErrorPopoverAnchorEl ? (
              <Popover
                open={!!validationErrorMessage}
                anchorEl={inputErrorPopoverAnchorEl}
                disableAutoFocus
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                {validationErrorMessage ? (
                  <Alert severity="error" variant="outlined">
                    {validationErrorMessage}
                  </Alert>
                ) : null}
              </Popover>
            ) : null}
          </React.Fragment>
        ) : (
          rest.label
        )
      }
      sx={
        isEditing
          ? {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              '.MuiTreeItem-content': {
                backgroundColor: 'transparent',
              },
              ...sx,
            }
          : sx
      }
    />
  );
}
