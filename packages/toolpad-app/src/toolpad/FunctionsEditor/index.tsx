import * as React from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  InputBase,
  Popover,
  Skeleton,
  TextField,
  InputAdornment,
  IconButton,
  generateUtilityClasses,
  styled,
  Stack,
  useTheme,
  alpha,
  Typography,
  Button,
  Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { TreeView, treeItemClasses, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import JavascriptIcon from '@mui/icons-material/Javascript';
import ClearIcon from '@mui/icons-material/Clear';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import { useQuery } from '@tanstack/react-query';
import { ensureSuffix } from '@mui/toolpad-utils/strings';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import OpenCodeEditorButton from '../../components/OpenCodeEditor';
import FlexFill from '../../components/FlexFill';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';
import ToolpadShell from '../ToolpadShell';
import client from '../../api';
import {
  parseFunctionId,
  parseLegacyFunctionId,
  serializeFunctionId,
} from '../../toolpadDataSources/local/shared';
import { LocalPrivateApi } from '../../toolpadDataSources/local/types';

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
    fontFamily: theme.typography.fontFamilyCode,
    fontSize: 15,
    padding: 4,
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  [`& .${treeItemClasses.group}`]: {
    borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
    position: 'relative',
    left: '-2px',
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
          <JavascriptIcon fontSize="large" />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.name}
          </span>
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

export default function FunctionsEditor() {
  const theme = useTheme();

  const [selectedHandler, setSelectedHandler] = React.useState<string | null>(null);
  const { file: selectedFile = undefined, handler: selectedFunction = undefined } = selectedHandler
    ? parseLegacyFunctionId(selectedHandler)
    : {};

  const selectedNodeId: string | null = selectedFile
    ? serializeFunctionId({
        file: selectedFile,
        handler: selectedFunction,
      })
    : null;

  const [expanded, setExpanded] = React.useState<string[]>(selectedFile ? [selectedFile] : []);

  const [search, setSearch] = React.useState('');

  const execPrivate = React.useCallback(
    <K extends keyof LocalPrivateApi>(
      method: K,
      args: Parameters<LocalPrivateApi[K]>,
    ): Promise<Awaited<ReturnType<LocalPrivateApi[K]>>> => {
      return client.mutation.dataSourceExecPrivate('local', method, args);
    },
    [],
  );

  const introspection = useQuery({
    queryKey: ['introspection'],
    queryFn: () => execPrivate('introspection', []),
    retry: false,
  });

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
      await execPrivate('createNew', [fileName]);
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
    execPrivate,
    handleCloseCreateNewHandler,
    inputError,
    introspection,
    newHandlerInput,
    newHandlerLoading,
  ]);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearch('');
  }, []);

  return (
    <ToolpadShell>
      <Box sx={{ height: 'calc(100vh - 48px)' }}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={26} minSize={24}>
            <Box sx={{ height: '100%', overflow: 'auto', position: 'relative' }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  width: '100%',
                  padding: 1,
                  zIndex: 1,
                }}
              >
                <TextField
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Find function…"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearSearch} edge="end">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  variant="outlined"
                  fullWidth
                />
                <IconButton size="medium" onClick={handleOpenCreateNewHandler}>
                  <NoteAddIcon color="primary" fontSize="inherit" />
                </IconButton>
              </Stack>
              <TreeView
                ref={handlerTreeRef}
                selected={selectedNodeId}
                onNodeSelect={handleSelectFunction}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expanded}
                onNodeToggle={(_event, nodeIds) => setExpanded(nodeIds)}
                sx={{
                  mt: -1,
                  padding: 1,
                }}
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
                            setNewHandlerInput(event.target.value.replaceAll(/[^a-zA-Z0-9.]/g, ''))
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
                          startAdornment={
                            <InputAdornment position="start" sx={{ ml: '-6px', mr: '0px' }}>
                              <JavascriptIcon fontSize="large" />
                            </InputAdornment>
                          }
                          placeholder="New file name…"
                          fullWidth
                          sx={{
                            padding: 0.5,
                            backgroundColor: 'none !important',
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
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      '.MuiTreeItem-content': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />
                ) : null}

                {introspection.data?.files
                  ?.filter((file) =>
                    search ? file.name.toLowerCase().includes(search.toLowerCase()) : true,
                  )
                  .map((file) => (
                    <HandlerFileTreeItem key={file.name} file={file} />
                  ))}

                {introspection.data?.files.length === 0 ? (
                  <Stack alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="body1">You don&apos;t have any functions yet…</Typography>
                    <Button
                      onClick={handleOpenCreateNewHandler}
                      variant="outlined"
                      startIcon={<NoteAddIcon />}
                      size="medium"
                      sx={{ mt: 1 }}
                    >
                      Create function
                    </Button>
                  </Stack>
                ) : null}

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
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack alignItems="center" sx={{ px: 4 }}>
                <Typography variant="body1" textAlign="center">
                  <strong>Custom Functions</strong> allow you to run your own Javascript code,
                  directly from your file system.
                </Typography>
                <Link
                  href="https://mui.com/toolpad/concepts/custom-functions"
                  target="_blank"
                  rel="noopener"
                  textAlign="center"
                  sx={{ mt: 1 }}
                >
                  Read more about Custom Functions
                </Link>
              </Stack>
            </Box>
          </Panel>
        </PanelGroup>
      </Box>
    </ToolpadShell>
  );
}
