import * as React from 'react';
import { BindableAttrEntries } from '@mui/toolpad-core';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputBase,
  Popover,
  Skeleton,
  Stack,
  Typography,
  generateUtilityClasses,
  styled,
} from '@mui/material';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { TreeView, treeItemClasses, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import { useQuery } from '@tanstack/react-query';
import { ensureSuffix } from '@mui/toolpad-utils/strings';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { LocalPrivateApi, LocalQuery, LocalConnectionParams } from './types';
import {
  useEvaluateLiveBindingEntries,
  useEvaluateLiveBindings,
} from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import * as appDom from '../../appDom';
import JsonView from '../../components/JsonView';
import OpenCodeEditorButton from '../../toolpad/OpenCodeEditor';
import useQueryPreview from '../useQueryPreview';
import QueryInputPanel from '../QueryInputPanel';
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
          <OpenCodeEditorButton iconButton filePath={file.name} fileType="resource" />
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
    async (query: LocalQuery, params: Record<string, string>) =>
      execApi('debugExec', [query, params]),
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

  const handlerTreeRef = React.useRef<HTMLUListElement>(null);

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
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50} minSize={20}>
        <QueryInputPanel
          previewDisabled={!selectedOption}
          onRunPreview={handleRunPreview}
          actions={<Button onClick={handleOpenCreateNewHandler}>New handler file</Button>}
        >
          <Stack direction="row" sx={{ gap: 2, height: '100%', mx: 3 }}>
            <Box sx={{ position: 'relative', overflow: 'auto', height: '100%', width: '40%' }}>
              <TreeView
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
              </TreeView>
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
            </Box>

            <Stack sx={{ gap: 1, flex: 1, overflow: 'auto' }}>
              <Typography>Parameters:</Typography>
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
          </Stack>
        </QueryInputPanel>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50} minSize={20}>
        <QueryPreview isLoading={previewIsLoading} error={preview?.error}>
          <JsonView sx={{ height: '100%' }} copyToClipboard src={preview?.data} />
        </QueryPreview>
      </Panel>
    </PanelGroup>
  );
}

function getInitialQueryValue(): LocalQuery {
  return {};
}

const dataSource: ClientDataSource<LocalConnectionParams, LocalQuery, LocalPrivateApi> = {
  displayName: 'Local',
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
