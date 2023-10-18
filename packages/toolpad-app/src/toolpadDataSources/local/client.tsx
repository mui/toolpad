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
  Divider,
  InputBase,
  ListSubheader,
  Stack,
  Tab,
  Typography,
  styled,
  alpha,
} from '@mui/material';
import { TabContext, TabList } from '@mui/lab';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { errorFrom } from '@mui/toolpad-utils/errors';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DoneIcon from '@mui/icons-material/Done';
import { useQuery } from '@tanstack/react-query';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import TabPanel from '../../components/TabPanel';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { LocalPrivateApi, LocalQuery, LocalConnectionParams } from './types';
import {
  useEvaluateLiveBindingEntries,
  useEvaluateLiveBindings,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import { useAppStateApi } from '../../toolpad/AppState';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import JsonView from '../../components/JsonView';
import OpenCodeEditorButton from '../../toolpad/OpenCodeEditor';
import useQueryPreview from '../useQueryPreview';
import QueryPreview from '../QueryPreview';
import BindableEditor from '../../toolpad/AppEditor/PageEditor/BindableEditor';
import { getDefaultControl, usePropControlsContext } from '../../toolpad/propertyControls';
import { parseFunctionId, parseLegacyFunctionId, serializeFunctionId } from './shared';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';
import QueryToolsContext from '../../toolpad/AppEditor/PageEditor/QueryEditor/QueryToolsContext';

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
  files: FileIntrospectionResult[];
  selectedFunctionId?: string;
  onCreateNew: () => void;
  onSelect: (functionName: string) => void;
}

function FunctionAutocomplete({
  files,
  selectedFunctionId,
  onCreateNew,
  onSelect,
}: FunctionAutocompleteProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = React.useState<string>('');

  const { selectedFileName, selectedFunctionName } = React.useMemo(() => {
    const parsed = parseFunctionId(selectedFunctionId ?? '');
    return {
      selectedFileName: parsed.file,
      selectedFunctionName: parsed.handler,
    };
  }, [selectedFunctionId]);

  const selectedFunctionLabel = React.useMemo(() => {
    if (selectedFileName) {
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

  const handleCreateNew = React.useCallback(() => {
    onCreateNew();
  }, [onCreateNew]);

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
              groupBy={(option) => parseFunctionId(option).file ?? ''}
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
                    {parseFunctionId(option).handler ?? ''}
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
                const fa = parseFunctionId(a).file;
                const fb = parseFunctionId(b).file;

                // Display the file with the selected function first.
                const sf = parseFunctionId(selectedFunctionId ?? '').file;

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
  );
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
  settingsToggle,
  settingsTab,
  tabType,
  execApi,
}: QueryEditorProps<LocalConnectionParams, LocalQuery, LocalPrivateApi>) {
  const appStateApi = useAppStateApi();
  const introspection = useQuery({
    queryKey: ['introspection'],
    queryFn: () => execApi('introspection', []),
    retry: false,
  });

  const updateProp = React.useCallback(
    (prop: string, value: any) => {
      appStateApi.updateQueryDraft((draft) => ({
        ...draft,
        attributes: {
          ...draft.attributes,
          query: {
            ...draft.attributes.query,
            [prop]: value,
          },
        },
      }));
    },
    [appStateApi],
  );

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
    toolsTabType,
    handleToolsTabTypeChange,
    isPreviewLoading,
    setIsPreviewLoading,
    setHandleRunPreview,
  } = React.useContext(QueryToolsContext);

  const { preview, runPreview } = useQueryPreview(
    fetchServerPreview,
    input.attributes.query,
    previewParams as Record<string, string>,
    {
      onPreview() {
        setIsPreviewLoading(false);
      },
    },
  );

  const handleRunPreview = React.useCallback(() => {
    setIsPreviewLoading(true);
    runPreview();
  }, [setIsPreviewLoading, runPreview]);

  React.useEffect(() => {
    setHandleRunPreview(() => handleRunPreview);
  }, [setHandleRunPreview, handleRunPreview]);

  const liveBindings = useEvaluateLiveBindings({
    jsRuntime: jsBrowserRuntime,
    input: paramsObject,
    globalScope,
  });

  const handleSelectFunction = React.useCallback(
    (functionId: string) => {
      updateProp('function', functionId);
    },
    [updateProp],
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
  }, [execApi, introspection, proposedFileName]);

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50} minSize={40} style={{ overflow: 'auto', scrollbarGutter: 'stable' }}>
        <Stack direction="column" gap={0}>
          <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              fontSize={12}
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.grey[500] : 'default',
              }}
            >
              {tabType === 'config' ? 'Configuration' : 'Settings'}
            </Typography>
            {settingsToggle}
          </Stack>
          <Divider />
          {tabType === 'config' ? (
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
                files={introspection.data?.files || []}
                selectedFunctionId={input.attributes.query.function || ''}
                onCreateNew={handleCreateNewCommit}
                onSelect={handleSelectFunction}
              />
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
            </Stack>
          ) : (
            settingsTab
          )}
        </Stack>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50} minSize={20}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={40} style={{ overflow: 'auto', scrollbarGutter: 'stable' }}>
            <Box
              display={'flex'}
              flexDirection={'column'}
              sx={{
                px: 1,
                pt: 0.25,
              }}
            >
              <Typography
                fontSize={12}
                sx={{
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? theme.palette.grey[500] : 'default',
                }}
              >
                Parameters
              </Typography>
              <Divider sx={{ mb: 1 }} />

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
                      appStateApi.updateQueryDraft((draft) => ({
                        ...draft,
                        params: newParams,
                      }));
                    }}
                  />
                ) : null;
              })}
            </Box>
          </Panel>
          <PanelResizeHandle />
          {toolsTabType ? (
            <Panel defaultSize={60} style={{ overflow: 'auto', scrollbarGutter: 'stable' }}>
              <TabContext value={toolsTabType}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    height: 32,
                  }}
                >
                  <TabList
                    sx={{ '& button': { fontSize: 12, fontWeight: 'normal' } }}
                    onChange={handleToolsTabTypeChange}
                    aria-label="Query tools active tab"
                  >
                    <Tab label="Preview" value="preview" />
                  </TabList>
                </Box>
                <TabPanel value="preview" disableGutters>
                  <QueryPreview isLoading={isPreviewLoading} error={preview?.error}>
                    <ResolvedPreview preview={preview} />
                  </QueryPreview>
                </TabPanel>
              </TabContext>
            </Panel>
          ) : null}
        </PanelGroup>
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
