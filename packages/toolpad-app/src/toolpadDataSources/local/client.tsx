import * as React from 'react';
import { BindableAttrEntries } from '@mui/toolpad-core';
import {
  Alert,
  Autocomplete,
  AutocompleteCloseReason,
  autocompleteClasses,
  Box,
  Button,
  CircularProgress,
  InputBase,
  Popover,
  Skeleton,
  TextField,
  Stack,
  Tab,
  Typography,
  generateUtilityClasses,
  styled,
  useTheme,
} from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { errorFrom } from '@mui/toolpad-utils/errors';
import {
  LoadingButton,
  TabPanel,
  TreeItem,
  TabContext,
  TabList,
  TreeView,
  treeItemClasses,
} from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import { useQuery } from '@tanstack/react-query';
import { ensureSuffix } from '@mui/toolpad-utils/strings';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import ButtonBase from '@mui/material/ButtonBase';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { LocalPrivateApi, LocalQuery, LocalConnectionParams } from './types';
import {
  useEvaluateLiveBindingEntries,
  useEvaluateLiveBindings,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import * as appDom from '../../appDom';
import SplitPane from '../../components/SplitPane';
import JsonView from '../../components/JsonView';
import OpenCodeEditorButton from '../../components/OpenCodeEditor';
import useQueryPreview from '../useQueryPreview';
// import QueryInputPanel from '../QueryInputPanel';
import QueryPreview from '../QueryPreview';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import { getDefaultControl, usePropControlsContext } from '../../toolpad/propertyControls';
import { parseFunctionId, parseLegacyFunctionId, serializeFunctionId } from './shared';
import FlexFill from '../../components/FlexFill';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';

const fileTreeItemClasses = generateUtilityClasses('FileTreeItem', ['actionButton', 'handlerItem']);

const FileTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.label}`]: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    paddingRight: 0,

    [`&:hover .${fileTreeItemClasses.actionButton}`]: {
      visibility: 'visible',
    },
  },

  [`& .${fileTreeItemClasses.actionButton}`]: {
    visibility: 'hidden',
  },

  [`& .${fileTreeItemClasses.handlerItem} .${treeItemClasses.label}`]: {
    fontSize: '0.8em',
    padding: 0,
    fontFamily: theme.typography.fontFamilyCode,
  },
}));

interface HandlerFileTreeItemProps {
  file: FileIntrospectionResult;
}

function HandlerFileTreeItem({ file }: HandlerFileTreeItemProps) {
  return (
    <FileTreeItemRoot
      key={file.name}
      nodeId={serializeFunctionId({ file: file.name })}
      label={
        <React.Fragment>
          {file.name}
          <FlexFill />
          <OpenCodeEditorButton iconButton filePath={file.name} fileType="query" />
        </React.Fragment>
      }
    >
      {file.handlers.map((handler) => {
        return (
          <TreeItem
            className={fileTreeItemClasses.handlerItem}
            key={handler.name}
            nodeId={serializeFunctionId({ file: file.name, handler: handler.name })}
            label={handler.name}
          />
        );
      })}
    </FileTreeItemRoot>
  );
}

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
    color: 'inherit',
    fontSize: 13,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
    padding: 0,
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 'auto',
      alignItems: 'flex-start',
      padding: 8,
      borderBottom: `1px solid  ${theme.palette.mode === 'light' ? ' #eaecef' : '#30363d'}`,
      '&[aria-selected="true"]': {
        backgroundColor: 'transparent',
      },
      [`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
        {
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
  border: `1px solid ${theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d'}`,
  boxShadow: `0 8px 24px ${
    theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'
  }`,
  borderRadius: 6,
  width: 300,
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  color: theme.palette.mode === 'light' ? '#24292e' : '#c9d1d9',
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  padding: 10,
  width: '100%',
  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
  '& input': {
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#0d1117',
    padding: 8,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    border: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
    fontSize: 14,
    '&:focus': {
      boxShadow: `0px 0px 0px 3px ${
        theme.palette.mode === 'light' ? 'rgba(3, 102, 214, 0.3)' : 'rgb(12, 45, 107)'
      }`,
      borderColor: theme.palette.mode === 'light' ? '#0366d6' : '#388bfd',
    },
  },
}));

const FunctionButton = styled(ButtonBase)(({ theme }) => ({
  fontSize: 12,
  width: '100%',
  fontFamily: theme.typography.fontFamilyCode,
  paddingBottom: 0,
  fontWeight: 'normal',
  '& svg': {
    width: 12,
    height: 12,
  },
}));

function FunctionAutocomplete({
  fileName,
  options,
  selected,
}: {
  fileName: string;
  options: string[];
  selected: string;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [value, setValue] = React.useState<string>(selected);
  const [pendingValue, setPendingValue] = React.useState<string>('');
  // const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setPendingValue(selected);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setValue(pendingValue);
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'github-label' : undefined;

  return options.length > 0 ? (
    <React.Fragment>
      <Box sx={{ mt: 2, fontSize: 12 }}>
        <FunctionButton disableRipple aria-describedby={id} onClick={handleClick}>
          <span>{fileName}</span>
          <ExpandMoreIcon sx={{ ml: 1 }} />
        </FunctionButton>
        <Box
          key={selected}
          sx={{
            ml: 3,
            mt: 0.5,
            p: 0.5,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 11,
            fontFamily: (theme) => theme.typography.fontFamilyCode,
            color: (theme) => theme.palette.primary.main,
          }}
        >
          {selected}
        </Box>
      </Box>
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
              Search handler functions
            </Box>
            <Autocomplete
              open
              onClose={(event: React.ChangeEvent<{}>, reason: AutocompleteCloseReason) => {
                if (reason === 'escape') {
                  handleClose();
                }
              }}
              value={pendingValue}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === 'keydown' &&
                  (event as React.KeyboardEvent).key === 'Backspace' &&
                  reason === 'removeOption'
                ) {
                  return;
                }
                setPendingValue(newValue ?? '');
              }}
              PopperComponent={PopperComponent}
              renderTags={() => null}
              noOptionsText="No handlers"
              renderOption={(props, option, { selected: selectedValue }) => (
                <li {...props}>
                  <Box
                    component={DoneIcon}
                    sx={{ width: 17, height: 17, mr: '5px', ml: '-2px' }}
                    style={{
                      visibility: selectedValue ? 'visible' : 'hidden',
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
                    }}
                  >
                    {option}
                  </Box>
                </li>
              )}
              options={options.sort((a, b) => {
                // Display the selected handler first.
                if (selected === a) {
                  return -1;
                }
                if (selected === b) {
                  return 1;
                }
                const ai = selected.charCodeAt(0);
                const bi = selected.charCodeAt(0);
                return ai - bi;
              })}
              // options={options}
              renderInput={(params) => (
                <StyledInput
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  placeholder="Filter handlers"
                />
              )}
            />
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

  const selectedNodeId: string | undefined = selectedFile
    ? serializeFunctionId({
        file: selectedFile,
        handler: selectedFunction,
      })
    : undefined;

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
    (_event: React.SyntheticEvent, nodeId: string) => {
      const parsed = parseFunctionId(nodeId);
      if (parsed.handler) {
        setSelectedHandler(nodeId);
      }
    },
    [setSelectedHandler],
  );

  const handlerTreeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    handlerTreeRef.current?.querySelector(`.${treeItemClasses.selected}`)?.scrollIntoView();
  }, []);

  const [newHandlerInput, setNewHandlerInput] = React.useState('');
  const [newHandlerLoading, setNewHandlerLoading] = React.useState(false);

  const {
    value: isCreateNewHandlerOpen,
    setTrue: handleOpenCreateNewHandler,
    setFalse: handleCloseCreateNewHandlerDialog,
  } = useBoolean(false);

  const handleCloseCreateNewHandler = React.useCallback(() => {
    setNewHandlerInput('');
    handleCloseCreateNewHandlerDialog();
  }, [handleCloseCreateNewHandlerDialog]);

  const [expanded, setExpanded] = React.useState<string[]>(selectedFile ? [selectedFile] : []);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const createNewInputRef = React.useRef(null);
  const open = !!anchorEl;

  const inputError: string | null = React.useMemo(() => {
    const alreadyExists = introspection.data?.files.some(
      (file) => file.name === newHandlerInput || file.name === ensureSuffix(newHandlerInput, '.ts'),
    );

    return alreadyExists ? 'File already exists' : null;
  }, [introspection.data?.files, newHandlerInput]);

  React.useEffect(() => {
    setAnchorEl(inputError ? createNewInputRef.current : null);
  }, [inputError]);

  const handleCreateNewCommit = React.useCallback(async () => {
    if (!newHandlerInput || inputError || newHandlerLoading) {
      handleCloseCreateNewHandler();
      return;
    }

    const fileName = ensureSuffix(newHandlerInput, '.ts');

    setNewHandlerLoading(true);
    try {
      await execApi('createNew', [fileName]);
      await introspection.refetch();
    } catch (error) {
      // eslint-disable-next-line no-alert
      window.alert(errorFrom(error).message);
    } finally {
      setNewHandlerLoading(false);
    }

    const newNodeId = serializeFunctionId({ file: fileName, handler: 'default' });
    setSelectedHandler(newNodeId);
    setExpanded([fileName]);
    handleCloseCreateNewHandler();
  }, [
    execApi,
    handleCloseCreateNewHandler,
    inputError,
    introspection,
    newHandlerInput,
    newHandlerLoading,
    setSelectedHandler,
  ]);

  return (
    <SplitPane split="vertical" size="60%" primary="first" allowResize sx={{ maxWidth: '80%' }}>
      {/* <QueryInputPanel
        previewDisabled={!selectedOption}
        onRunPreview={handleRunPreview}
        actions={<Button onClick={handleOpenCreateNewHandler}>New handler file</Button>}
      > */}
      <Box display={'grid'} gridTemplateColumns={'60% auto auto'} height={'100%'} columnGap={1}>
        {/* <Stack direction="row" sx={{ gap: 2, height: '100%', mx: 3 }}> */}
        {/* <Box sx={{ position: 'relative', overflow: 'auto', height: '100%', width: '40%' }}> */}
        {/* <TreeView
          ref={handlerTreeRef}
          selected={selectedNodeId}
          onNodeSelect={handleSelectFunction}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          onNodeToggle={(_event, nodeIds) => setExpanded(nodeIds)}
        >
          {isCreateNewHandlerOpen ? (
            <TreeItem
              nodeId="::create::"
              label={
                <React.Fragment>
                  <InputBase
                    ref={createNewInputRef}
                    value={newHandlerInput}
                    onChange={(event) =>
                      setNewHandlerInput(event.target.value.replaceAll(/[^a-zA-Z0-9]/g, ''))
                    }
                    autoFocus
                    disabled={newHandlerLoading}
                    endAdornment={newHandlerLoading ? <CircularProgress size={16} /> : null}
                    onBlur={handleCreateNewCommit}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCreateNewCommit();
                      } else if (event.key === 'Escape') {
                        handleCloseCreateNewHandler();
                        event.stopPropagation();
                      }
                    }}
                  />
                  <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    disableAutoFocus
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <Alert severity="error" variant="outlined">
                      {inputError}
                    </Alert>
                  </Popover>
                </React.Fragment>
              }
            />
          ) : null}

          {introspection.data?.files?.map((file) => (
            <HandlerFileTreeItem key={file.name} file={file} />
          ))}

          {introspection.isLoading ? (
            <React.Fragment>
              <TreeItem disabled nodeId="::loading::" label={<Skeleton />} />
              <TreeItem disabled nodeId="::loading::" label={<Skeleton />} />
              <TreeItem disabled nodeId="::loading::" label={<Skeleton />} />
            </React.Fragment>
          ) : null}
        </TreeView> */}
        {/* <TabContext value={selectedFile}>
          <div>
            <TabList
              sx={{
                '& button': { fontSize: 12, fontWeight: 'normal' },
              }}
            >
              {introspection.data?.files?.map((file) => (
                <Tab
                  key={file.name}
                  label={file.name}
                  value={file.name}
                  sx={{
                    fontSize: 10,

                    borderBottom: (theme) => `1px solid ${theme.palette.grey[400]}`,
                  }}
                />
              ))}
            </TabList>
            {introspection.data?.files?.map((file) => (
              <TabPanel key={file.name} value={file.name} sx={{ p: 0 }}> */}
        <Stack
          display="grid"
          gridTemplateColumns={'2fr 1fr'}
          sx={{ borderRight: (theme) => `1px solid ${theme.palette.grey[300]}` }}
        >
          {introspection.data?.files?.map((file) => (
            <FunctionAutocomplete
              key={file.name}
              fileName={file.name}
              options={file.handlers.map((handler) => handler.name)}
              selected={selectedFunction || ''}
            />
          ))}

          <LoadingButton
            loading={previewIsLoading}
            onClick={handleRunPreview}
            variant="contained"
            sx={{ alignSelf: 'start', justifySelf: 'flex-start', width: '75%', mt: 2.5, mx: 0 }}
          >
            Preview
          </LoadingButton>
        </Stack>

        {/* </TabPanel>
            ))}
          </div>
        </TabContext> */}
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
        {/* </Box> */}

        <Stack sx={{ gap: 1, mt: 2 }}>
          <Typography fontSize={12}>Parameters:</Typography>
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
        {/* </Stack> */}
      </Box>
      {/* </QueryInputPanel> */}

      <QueryPreview isLoading={previewIsLoading} error={preview?.error}>
        <ResolvedPreview preview={preview} />
      </QueryPreview>
    </SplitPane>
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
