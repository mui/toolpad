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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { TreeView, treeItemClasses, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import JavascriptIcon from '@mui/icons-material/Javascript';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import { useQuery } from '@tanstack/react-query';
import { ensureSuffix } from '@mui/toolpad-utils/strings';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import OpenCodeEditorButton from '../../components/OpenCodeEditor';
import FlexFill from '../../components/FlexFill';
import { FileIntrospectionResult } from '../../server/functionsTypesWorker';
import ToolpadShell from '../ToolpadShell';
import client from '../../api';
import { serializeFunctionId } from '../../toolpadDataSources/local/shared';
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

export default function FunctionsEditor() {
  const theme = useTheme();

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

    handleCloseCreateNewHandler();
  }, [
    execPrivate,
    handleCloseCreateNewHandler,
    inputError,
    introspection,
    newHandlerInput,
    newHandlerLoading,
  ]);

  return (
    <ToolpadShell>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={26} minSize={24}>
          <Box sx={{ padding: 1, height: '100%' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Find function..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                fullWidth
              />
              <IconButton size="medium" onClick={handleOpenCreateNewHandler}>
                <PlaylistAddIcon color="primary" fontSize="inherit" />
              </IconButton>
            </Stack>
            <TreeView
              ref={handlerTreeRef}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{ mt: 1 }}
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
                        startAdornment={
                          <InputAdornment position="start" sx={{ ml: '-6px', mr: '0px' }}>
                            <JavascriptIcon fontSize="large" />
                          </InputAdornment>
                        }
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
                  sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.3), padding: 0.45 }}
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
        </Panel>
        <PanelResizeHandle />
        <Panel />
      </PanelGroup>
    </ToolpadShell>
  );
}
