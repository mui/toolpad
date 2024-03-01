import * as React from 'react';
import {
  Autocomplete,
  AutocompleteCloseReason,
  autocompleteClasses,
  Box,
  Button,
  Chip,
  InputBase,
  ListSubheader,
  Stack,
  styled,
  alpha,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import DoneIcon from '@mui/icons-material/Done';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';
import OpenCodeEditorButton from '../../toolpad/OpenCodeEditor';
import { parseLegacyFunctionId, serializeFunctionId } from './shared';

interface PopperComponentProps {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
}

const StyledAutocompletePopper = styled('div')(({ theme }) => ({
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: 'none',
    margin: 0,
    borderRadius: 0,
    color: 'inherit',
    fontSize: 12,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.background.paper
        : theme.palette.primaryDark[900],
    padding: 0,
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 'auto',
      alignItems: 'flex-start',
      padding: 8,
      borderBottom: `1px solid  ${theme.palette.divider}`,
      [`&.${autocompleteClasses.focused}:not([aria-selected="true"])`]: {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: 'relative',
  },
}));

function PopperComponent(props: PopperComponentProps) {
  const { disablePortal, anchorEl, open, ...other } = props;
  return <StyledAutocompletePopper {...other} />;
}

const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 8px 24px ${
    theme.palette.mode === 'light'
      ? alpha(theme.palette.grey[800], 0.5)
      : alpha(theme.palette.grey[700], 0.2)
  }`,
  borderRadius: 6,
  width: 300,
  zIndex: theme.zIndex.modal,
  fontSize: 12,
  color: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.grey[500],
  backgroundColor: theme.palette.background.paper,
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  padding: 10,
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  '& input': {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    padding: 8,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    border: `1px solid ${theme.palette.divider}`,
    fontSize: 12,
    color: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.grey[500],
    '&:focus': {
      boxShadow: `0px 0px 0px 3px ${
        theme.palette.mode === 'light' ? theme.palette.primary[100] : theme.palette.primaryDark[600]
      }`,
      borderColor:
        theme.palette.mode === 'light'
          ? theme.palette.primary.main
          : theme.palette.primaryDark.main,
    },
  },
}));

const FunctionButton = styled(Chip)(({ theme }) => ({
  fontSize: 12,
  width: '100%',
  fontFamily: theme.typography.fontFamilyCode,
  marginTop: theme.spacing(1),
  fontWeight: 'normal',
  color: theme.palette.primary.main,
  transition: theme.transitions.create('color', { duration: theme.transitions.duration.shorter }),
  '&:active': {
    boxShadow: 'none',
  },
  '&:focus': {
    backgroundColor:
      theme.palette.mode === 'light' ? theme.palette.primary[100] : theme.palette.primaryDark[600],
  },
  '& svg': {
    width: 12,
    height: 12,
  },
}));

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
  lineHeight: 2.5,
  fontSize: 13,
  fontFamily: theme.typography.fontFamilyCode,
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.grey[200] : alpha(theme.palette.grey[900], 0.5),
  borderRadius: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.grey[500],
}));

interface FunctionAutocompleteProps {
  files: FileIntrospectionResult[];
  selectedFunctionId?: string;
  onCreateNew: () => Promise<string>;
  onSelect: (functionName: string) => void;
}

export default function FunctionSelector({
  files,
  selectedFunctionId,
  onCreateNew,
  onSelect,
}: FunctionAutocompleteProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = React.useState<string>('');

  const { selectedFileName, selectedFunctionName } = React.useMemo(() => {
    const parsed = parseLegacyFunctionId(selectedFunctionId ?? '');
    return {
      selectedFileName: parsed.file,
      selectedFunctionName: parsed.handler,
    };
  }, [selectedFunctionId]);

  const selectedFunctionLabel = React.useMemo(() => {
    if (selectedFunctionName) {
      return `${selectedFileName} > ${selectedFunctionName}`;
    }
    return 'Select function';
  }, [selectedFileName, selectedFunctionName]);

  const options = React.useMemo(() => {
    const functions: string[] = [];

    files.forEach((file) => {
      file.handlers.forEach((fn) => {
        functions.push(serializeFunctionId({ file: file.name, handler: fn.name }));
      });
    });
    return functions;
  }, [files]);

  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'function-selector' : undefined;

  const handleCreateNew = React.useCallback(async () => {
    const functionId = await onCreateNew();
    // Select the newly created function.
    onSelect(functionId);
  }, [onCreateNew, onSelect]);

  const handleInput = React.useCallback((event: React.FormEvent<HTMLInputElement>) => {
    setInputValue((event.target as HTMLInputElement).value);
  }, []);

  return (
    <React.Fragment>
      <FunctionButton
        aria-describedby={id}
        clickable
        icon={<DataObjectOutlinedIcon fontSize="inherit" color="inherit" />}
        onClick={handleClick}
        label={selectedFunctionLabel}
      />
      <StyledPopper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="auto-start"
        popperOptions={{ modifiers: [{ name: 'flip', enabled: false }] }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <div>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                fontWeight: 'bold',
              }}
            >
              Search for functions
            </Box>
            <Autocomplete
              open
              onClose={(event: React.ChangeEvent<{}>, reason: AutocompleteCloseReason) => {
                if (reason === 'escape') {
                  handleClose();
                }
              }}
              value={selectedFunctionId}
              inputValue={inputValue}
              onInput={handleInput}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === 'keydown' &&
                  (event as React.KeyboardEvent).key === 'Backspace' &&
                  reason === 'removeOption'
                ) {
                  return;
                }

                if (newValue) {
                  onSelect(newValue);
                }

                handleClose();
              }}
              PopperComponent={PopperComponent}
              renderTags={() => null}
              noOptionsText="No functions"
              groupBy={(option) => parseLegacyFunctionId(option).file ?? ''}
              renderGroup={(params) => [
                <StyledListSubheader key={params.key}>
                  <Stack direction="row" justifyContent={'space-between'}>
                    {params.group}
                    <OpenCodeEditorButton
                      filePath={params.group}
                      fileType="resource"
                      iconButton
                      disableRipple
                      sx={{
                        transition: (theme) => theme.transitions.create('color', { duration: 200 }),
                        '&:hover': {
                          color: (theme) =>
                            theme.palette.mode === 'light'
                              ? theme.palette.grey[800]
                              : theme.palette.grey[300],
                        },
                      }}
                    />
                  </Stack>
                </StyledListSubheader>,
                params.children,
              ]}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Box
                    component={DoneIcon}
                    sx={{
                      width: 17,
                      height: 17,
                      ml: 1,
                      mr: -1,
                      mt: 0,
                      opacity: 0.75,
                      color: selected ? 'primary.main' : 'text.primary',
                    }}
                    style={{
                      visibility: selected ? 'visible' : 'hidden',
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      flexShrink: 0,
                      mr: 1,
                      mt: 1,
                    }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      color: selected ? 'primary.main' : 'text.primary',
                      fontFamily: (theme) => theme.typography.fontFamilyCode,
                    }}
                  >
                    {parseLegacyFunctionId(option).handler ?? ''}
                  </Box>
                </li>
              )}
              options={options.sort((a, b) => {
                // Display the selected function first.
                if (selectedFunctionId === a) {
                  return -1;
                }
                if (selectedFunctionId === b) {
                  return 1;
                }

                // Then display the functions in the same file.
                const fa = parseLegacyFunctionId(a).file;
                const fb = parseLegacyFunctionId(b).file;

                // Display the file with the selected function first.
                const sf = parseLegacyFunctionId(selectedFunctionId ?? '').file;

                if (sf === fa) {
                  if (fa === fb) {
                    // Alphabetically sort functions with the same file
                    return a.localeCompare(b);
                  }
                  return -1;
                }
                if (sf === fb) {
                  return 1;
                }
                return fa?.localeCompare(fb ?? '') ?? 0;
              })}
              renderInput={(params) => (
                <StyledInput
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  placeholder="Filter functions"
                  autoFocus
                />
              )}
            />
            <Button
              sx={{ m: 1, mb: 0.5 }}
              startIcon={<AddOutlinedIcon fontSize="inherit" />}
              onClick={handleCreateNew}
            >
              New file
            </Button>
          </div>
        </ClickAwayListener>
      </StyledPopper>
    </React.Fragment>
  );
}
