import * as React from 'react';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view';
import {
  Alert,
  CircularProgress,
  InputBase,
  InputBaseProps,
  Popover,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

export interface EditableTreeItemProps extends Omit<TreeItemProps, 'label'> {
  labelText?: string;
  renderLabel?: (children: React.ReactNode) => React.ReactNode;
  suggestedNewItemName?: string;
  isEditing?: boolean;
  onEdit?: (newItemName: string) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  isLoading?: boolean;
  validateItemName?: (newItemName: string) => { isValid: boolean; errorMessage?: string };
  inputProps?: Omit<
    InputBaseProps,
    'value' | 'onChange' | 'autoFocus' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'fullWidth'
  >;
}

const defaultRenderLabel = (children: React.ReactNode) => children;

export default function EditableTreeItem({
  labelText = '',
  renderLabel = defaultRenderLabel,
  suggestedNewItemName = '',
  validateItemName,
  isEditing: isExternalEditing = false,
  onEdit,
  onCancel,
  isLoading = false,
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

  const handleConfirm = React.useCallback(async () => {
    if (!itemNameInput || !newItemValidationResult.isValid || isLoading) {
      handleCancel();
      return;
    }

    if (onEdit) {
      await onEdit(itemNameInput);
    }
    setIsInternalEditing(false);
  }, [handleCancel, isLoading, itemNameInput, newItemValidationResult.isValid, onEdit]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setItemNameInput(event.target.value.replaceAll(/[^a-zA-Z0-9]/g, ''));
  }, []);

  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    event.stopPropagation();
  }, []);

  const handleBlur = React.useCallback(() => {
    handleConfirm();
  }, [handleConfirm]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        handleConfirm();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, handleConfirm],
  );

  const inputErrorPopoverAnchorEl = inputRef.current;

  const labelTextSx = {
    fontSize: 14,
    pt: '4px',
    pb: '4px',
  };

  return (
    <TreeItem
      {...rest}
      onClick={handleClick}
      label={renderLabel(
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
              disabled={isLoading}
              endAdornment={isLoading ? <CircularProgress size={14} /> : null}
              sx={{
                ...(inputProps?.sx || {}),
                ...labelTextSx,
                padding: 0,
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
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'inherit',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...labelTextSx,
            }}
            noWrap
          >
            {labelText}
          </Typography>
        ),
      )}
      sx={{
        ...sx,
        paddingLeft: theme.spacing(0.5),
        '> .MuiTreeItem-content': {
          padding: theme.spacing(0, 0.5),
          gap: theme.spacing(0.5),
          backgroundColor: isEditing ? alpha(theme.palette.primary.main, 0.2) : undefined,
        },
      }}
    />
  );
}
