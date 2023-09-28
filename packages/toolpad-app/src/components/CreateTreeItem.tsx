import { TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view';
import { InputBase, alpha, Popover, Alert, useTheme, InputBaseProps } from '@mui/material';
import * as React from 'react';

interface CreateNodeTreeItemProps extends Omit<TreeItemProps, 'nodeId' | 'label'> {
  treeRef: React.RefObject<HTMLUListElement | null>;
  open: boolean;
  suggestedNewItemName?: string;
  onCreate: (newItemName: string) => void | Promise<void>;
  onClose: () => void | Promise<void>;
  validateItemName?: (newItemName: string) => { isValid: boolean; errorMessage?: string };
  inputProps?: Omit<
    InputBaseProps,
    'value' | 'onChange' | 'autoFocus' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'fullWidth'
  >;
}

export default function CreateTreeItem({
  treeRef,
  open,
  suggestedNewItemName = '',
  onCreate,
  onClose,
  validateItemName,
  inputProps,
  sx,
  ...rest
}: CreateNodeTreeItemProps) {
  const theme = useTheme();

  const createNewInputRef = React.useRef<HTMLInputElement | null>(null);

  const [newItemInput, setNewItemInput] = React.useState('');

  const newItemValidationResult = React.useMemo(
    () => (validateItemName ? validateItemName(newItemInput) : { isValid: true }),
    [newItemInput, validateItemName],
  );
  const validationErrorMessage = newItemValidationResult.errorMessage;

  const handleClose = React.useCallback(() => {
    setNewItemInput('');
    onClose();
  }, [onClose]);

  const [hasCreatedItem, setHasCreatedItem] = React.useState(false);

  const handleCreate = React.useCallback(() => {
    if (!newItemInput || !newItemValidationResult.isValid) {
      handleClose();
      return;
    }
    onCreate(newItemInput);

    setHasCreatedItem(true);
  }, [handleClose, newItemInput, newItemValidationResult.isValid, onCreate]);

  React.useEffect(() => {
    const tree = treeRef.current;

    if (tree && hasCreatedItem) {
      tree.querySelector(`.${treeItemClasses.selected}`)?.scrollIntoView();
      setHasCreatedItem(false);
    }
  }, [hasCreatedItem, treeRef]);

  React.useEffect(() => {
    if (!open) {
      setNewItemInput(suggestedNewItemName);
    }
  }, [open, suggestedNewItemName]);

  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (!suggestedNewItemName || (event && event.target.value !== suggestedNewItemName)) {
        handleCreate();
      } else {
        handleClose();
      }
    },
    [handleClose, handleCreate, suggestedNewItemName],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCreate();
      } else if (event.key === 'Escape') {
        handleClose();
        event.stopPropagation();
      }
    },
    [handleClose, handleCreate],
  );

  const inputErrorPopoverAnchorEl = createNewInputRef.current;

  if (!open) {
    return null;
  }

  return (
    <TreeItem
      {...rest}
      nodeId="::create::"
      label={
        <React.Fragment>
          <InputBase
            {...inputProps}
            ref={createNewInputRef}
            value={newItemInput}
            onChange={(event) => setNewItemInput(event.target.value)}
            autoFocus
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            fullWidth
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
      }
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        '.MuiTreeItem-content': {
          backgroundColor: 'transparent',
        },
        ...sx,
      }}
    />
  );
}
