import * as React from 'react';
import { BindableAttrEntries } from '@mui/toolpad-core';
import {
  Alert,
  Autocomplete,
  AutocompleteCloseReason,
  autocompleteClasses,
  Box,
  Button,
  Chip,
  InputBase,
  ListSubheader,
  Stack,
  Typography,
  styled,
  alpha,
} from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { LoadingButton } from '@mui/lab';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DoneIcon from '@mui/icons-material/Done';
import { useQuery } from '@tanstack/react-query';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { LocalPrivateApi, LocalQuery, LocalConnectionParams } from './types';
import {
  useEvaluateLiveBindingEntries,
  useEvaluateLiveBindings,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import * as appDom from '../../appDom';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import JsonView from '../../components/JsonView';
import OpenCodeEditorButton from '../../components/OpenCodeEditor';
import useQueryPreview from '../useQueryPreview';
import QueryPreview from '../QueryPreview';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import { getDefaultControl, usePropControlsContext } from '../../toolpad/propertyControls';
import { parseFunctionId, parseLegacyFunctionId, serializeFunctionId } from './shared';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';

const EMPTY_PARAMS: BindableAttrEntries = [];

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
  selectedFunctionFileName?: string;
  files: FileIntrospectionResult[];
  selectedFunctionName: string;
  onCreateNew: () => void;
  onSelect: (functionName: string) => void;
}

// function HandlerFileTreeItem({ file }: HandlerFileTreeItemProps) {
//   return (
//     <FileTreeItemRoot
//       key={file.name}
//       nodeId={serializeFunctionId({ file: file.name })}
//       label={
//         <React.Fragment>
//           {file.name}
//           <FlexFill />
//           <OpenCodeEditorButton iconButton filePath={file.name} fileType="resource" />
//         </React.Fragment>
//       }
//     >
//       {file.handlers.map((handler) => {
//         return (
//           <TreeItem
//             className={fileTreeItemClasses.handlerItem}
//             key={handler.name}
//             nodeId={serializeFunctionId({ file: file.name, handler: handler.name })}
//             label={handler.name}
//           />
//         );
//       })}
//     </FileTreeItemRoot>
//   );
// }

function FunctionAutocomplete({
  files,
  selectedFunctionName,
  onCreateNew,
  onSelect,
}: FunctionAutocompleteProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [value, setValue] = React.useState<string>(selectedFunctionName);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setValue(selectedFunctionName);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const [options, functionNameFileNameMap] = React.useMemo(() => {
    const functions: string[] = [];
    const nameMap = new Map<string, string>();
    files.forEach((file) => {
      file.handlers.forEach((fn) => {
        functions.push(fn.name);
        nameMap.set(fn.name, file.name);
      });
    });
    return [functions, nameMap];
  }, [files]);

  const open = Boolean(anchorEl);
  const id = open ? 'function-selector' : undefined;

  const handleCreateNew = React.useCallback(() => {
    onCreateNew();
  }, [onCreateNew]);

  return files.length > 0 ? (
    <React.Fragment>
      <FunctionButton
        aria-describedby={id}
        clickable
        icon={<DataObjectOutlinedIcon fontSize="inherit" color="inherit" />}
        onClick={handleClick}
        label={value || 'Select function'}
      />
      <StyledPopper id={id} open={open} anchorEl={anchorEl} placement="bottom-start">
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
              value={value}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === 'keydown' &&
                  (event as React.KeyboardEvent).key === 'Backspace' &&
                  reason === 'removeOption'
                ) {
                  return;
                }
                setValue(newValue ?? '');

                if (newValue) {
                  const selectedFile = functionNameFileNameMap.get(newValue);
                  if (selectedFile) {
                    onSelect(serializeFunctionId({ file: selectedFile, handler: newValue }));
                  }
                }

                handleClose();
              }}
              PopperComponent={PopperComponent}
              renderTags={() => null}
              noOptionsText="No functions"
              groupBy={(option) => functionNameFileNameMap.get(option) ?? ''}
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
                    {option}
                  </Box>
                </li>
              )}
              options={options.sort((a, b) => {
                // Display the selected function first.
                if (value === a) {
                  return -1;
                }
                if (value === b) {
                  return 1;
                }

                // Then display the functions in the same file.
                const fa = functionNameFileNameMap.get(a);
                const fb = functionNameFileNameMap.get(b);

                // Display the file with the selected function first.
                const sf = functionNameFileNameMap.get(value);

                if (sf === fa) {
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
  ) : null;
}

interface ResolvedPreviewProps {
  preview: any;
}

function ResolvedPreview({ preview }: ResolvedPreviewProps): React.ReactElement | null {
  if (!preview) {
    return (
      <Alert severity="info" sx={{ mx: 1, p: 1, fontSize: 11, width: 'fit-content' }}>
        <Box sx={{ mb: 1 }}>
          No request has been sent yet. <br />
          Click <span style={{ fontWeight: 'bold' }}>Preview</span> to preview the response here.
        </Box>
      </Alert>
    );
  }

  const { data } = preview;

  return <JsonView sx={{ height: '100%' }} src={data} copyToClipboard />;
}

function QueryEditor({
  globalScope,
  globalScopeMeta,
  value: input,
  onChange: setInput,
  execApi,
  onSave,
}: QueryEditorProps<LocalConnectionParams, LocalQuery, LocalPrivateApi>) {
  const introspection = useQuery({
    queryKey: ['introspection'],
    queryFn: () => execApi('introspection', []),
    retry: false,
  });

  const propTypeControls = usePropControlsContext();

  const { file: selectedFile = undefined, handler: selectedFunction = undefined } = input.attributes
    .query.function
    ? parseLegacyFunctionId(input.attributes.query.function)
    : {};

  const selectedOption = React.useMemo(() => {
    return introspection.data?.files
      .find((file) => file.name === selectedFile)
      ?.handlers.find((handler) => handler.name === selectedFunction);
  }, [introspection.data?.files, selectedFile, selectedFunction]);

  const parameterDefs = Object.fromEntries(selectedOption?.parameters || []);

  const paramsEntries = input.params?.filter(([key]) => !!parameterDefs[key]) || EMPTY_PARAMS;

  const paramsObject = Object.fromEntries(paramsEntries);

  const jsBrowserRuntime = useBrowserJsRuntime();

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    jsRuntime: jsBrowserRuntime,
    input: paramsEntries,
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding?.value])),
    [paramsEditorLiveValue],
  );

  const fetchServerPreview = React.useCallback(
    async (query: LocalQuery, params: Record<string, string>) => {
      return execApi('debugExec', [query, params]);
    },
    [execApi],
  );

  const {
    preview,
    runPreview: handleRunPreview,
    isLoading: previewIsLoading,
  } = useQueryPreview(
    fetchServerPreview,
    input.attributes.query,
    previewParams as Record<string, string>,
  );

  const liveBindings = useEvaluateLiveBindings({
    jsRuntime: jsBrowserRuntime,
    input: paramsObject,
    globalScope,
  });

  const setSelectedHandler = React.useCallback(
    (id: string) => {
      setInput((draft) => {
        return appDom.setQueryProp(draft, 'function', id);
      });
    },
    [setInput],
  );

  const handleSelectFunction = React.useCallback(
    (nodeId: string) => {
      const parsed = parseFunctionId(nodeId);
      if (parsed.handler) {
        setSelectedHandler(nodeId);
      }
    },
    [setSelectedHandler],
  );

  const proposedFileName = React.useMemo(() => {
    const existingNames = new Set(introspection.data?.files.map((file) => file.name) || []);
    const baseName = 'functions';
    let counter = 2;

    while (existingNames.has(`${baseName}${counter}.ts`)) {
      counter += 1;
    }

    return `${baseName}${counter}.ts`;
  }, [introspection.data?.files]);

  const handleCreateNewCommit = React.useCallback(async () => {
    try {
      await execApi('createNew', [proposedFileName]);
      await introspection.refetch();
    } catch (error) {
      // eslint-disable-next-line no-alert
      window.alert(errorFrom(error).message);
    }

    const newNodeId = serializeFunctionId({ file: proposedFileName, handler: 'default' });
    setSelectedHandler(newNodeId);
  }, [execApi, introspection, proposedFileName, setSelectedHandler]);

  React.useEffect(() => {
    onSave(input);
  }, [input, onSave]);

  return (
    <PanelGroup direction="vertical">
      <Panel defaultSize={60}>
        <Box display={'grid'} gridTemplateColumns={'60% auto auto'} height={'100%'} columnGap={1}>
          <Stack
            display="flex"
            flexDirection={'row'}
            sx={{
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              alignItems: 'flex-start',
              mt: 2,
              mx: 2,
            }}
          >
            <FunctionAutocomplete
              selectedFunctionFileName={selectedFile || ''}
              files={introspection.data?.files || []}
              selectedFunctionName={selectedFunction || ''}
              onCreateNew={handleCreateNewCommit}
              onSelect={handleSelectFunction}
            />

            <LoadingButton
              loading={previewIsLoading}
              onClick={handleRunPreview}
              variant="contained"
              disabled={!selectedFunction}
              sx={{ width: '80%', mx: 2.5, mt: 1 }}
            >
              Preview
            </LoadingButton>
          </Stack>

          {introspection.error ? (
            <Box
              sx={{
                position: 'absolute',
                inset: '0 0 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {errorFrom(introspection.error).message}
            </Box>
          ) : null}

          <Stack sx={{ gap: 1, mt: 2 }}>
            <Typography
              fontSize={12}
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.grey[500] : 'default',
              }}
            >
              Parameters:
            </Typography>
            {Object.entries(parameterDefs).map(([name, definiton]) => {
              const Control = getDefaultControl(propTypeControls, definiton, liveBindings);
              return Control ? (
                <BindableEditor
                  key={name}
                  liveBinding={liveBindings[name]}
                  globalScope={globalScope}
                  globalScopeMeta={globalScopeMeta}
                  label={name}
                  propType={definiton}
                  jsRuntime={jsBrowserRuntime}
                  renderControl={(renderControlParams) => (
                    <Control {...renderControlParams} propType={definiton} />
                  )}
                  value={paramsObject[name]}
                  onChange={(newValue) => {
                    const paramKeys = Object.keys(parameterDefs);
                    const newParams: BindableAttrEntries = paramKeys.flatMap((key) => {
                      const paramValue = key === name ? newValue : paramsObject[key];
                      return paramValue ? [[key, paramValue]] : [];
                    });
                    setInput((existing) => ({
                      ...existing,
                      params: newParams,
                    }));
                  }}
                />
              ) : null;
            })}
          </Stack>
        </Box>
      </Panel>
      <PanelResizeHandle />
      <Panel>
        <QueryPreview isLoading={previewIsLoading} error={preview?.error}>
          <ResolvedPreview preview={preview} />
        </QueryPreview>
      </Panel>
    </PanelGroup>
  );
}

function getInitialQueryValue(): LocalQuery {
  return {};
}

const dataSource: ClientDataSource<LocalConnectionParams, LocalQuery, LocalPrivateApi> = {
  displayName: 'Custom',
  isEnabled: true,
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
