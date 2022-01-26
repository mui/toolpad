import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinitions, RuntimeError } from '@mui/studio-core';
import CodeIcon from '@mui/icons-material/Code';
import PageIcon from '@mui/icons-material/Web';
import { getStudioComponent, useStudioComponent } from '../../../studioComponents';
import { ExactEntriesOf } from '../../../utils/types';
import * as studioDom from '../../../studioDom';
import ComponentPropEditor from './ComponentPropEditor';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import useLatest from '../../../utils/useLatest';
import renderPageCode from '../../../renderPageCode';

const classes = {
  control: 'StudioControl',
};

const ComponentPropsEditorRoot = styled('div')(({ theme }) => ({
  [`& .${classes.control}`]: {
    margin: theme.spacing(1, 0),
  },
}));

interface ComponentPropsEditorProps<P> {
  node: studioDom.StudioElementNode<P>;
  actualValues: { [key: string]: unknown };
}

function ComponentPropsEditor<P>({ node, actualValues }: ComponentPropsEditorProps<P>) {
  const dom = useDom();
  const definition = getStudioComponent(dom, node.component);

  return (
    <ComponentPropsEditorRoot>
      {(Object.entries(definition.argTypes) as ExactEntriesOf<ArgTypeDefinitions<P>>).map(
        ([propName, propTypeDef]) =>
          typeof propName === 'string' && propTypeDef ? (
            <div key={propName} className={classes.control}>
              <ComponentPropEditor
                name={propName}
                argType={propTypeDef}
                node={node}
                actualValue={actualValues[propName]}
              />
            </div>
          ) : null,
      )}
    </ComponentPropsEditorRoot>
  );
}

interface RuntimeErrorAlertProps {
  error: RuntimeError;
}

function RuntimeErrorAlert({ error }: RuntimeErrorAlertProps) {
  return (
    <Alert severity="error" sx={{ overflow: 'auto' }}>
      <AlertTitle>Error</AlertTitle>
      <pre>{error.stack}</pre>
    </Alert>
  );
}

interface SelectedNodeEditorProps {
  node: studioDom.StudioElementNode;
}

const DEFAULT_ACTUAL_VALUES = {};

function SelectedNodeEditor({ node }: SelectedNodeEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const { viewState } = usePageEditorState();
  const nodeError = viewState[node.id]?.error;
  const actualValues = viewState[node.id]?.props ?? DEFAULT_ACTUAL_VALUES;

  const [nameInput, setNameInput] = React.useState(node.name);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const handleNameCommit = React.useCallback(
    () => domApi.setNodeName(node.id, nameInput),
    [domApi, node.id, nameInput],
  );

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        handleNameCommit();
      }
    },
    [handleNameCommit],
  );

  const component = useStudioComponent(dom, node.component);

  return (
    <React.Fragment>
      <Typography variant="subtitle1">{component.displayName}</Typography>
      <Typography variant="subtitle2">ID: {node.id}</Typography>
      <TextField
        fullWidth
        size="small"
        label="name"
        value={nameInput}
        onChange={handleNameInputChange}
        onBlur={handleNameCommit}
        onKeyPress={handleKeyPress}
      />
      {/* eslint-disable-next-line no-nested-ternary */}
      {nodeError ? (
        <RuntimeErrorAlert error={nodeError} />
      ) : node ? (
        <React.Fragment>
          <div>props:</div>
          <ComponentPropsEditor node={node} actualValues={actualValues} />
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
}

function DefaultPanel() {
  const dom = useDom();
  const state = usePageEditorState();
  const [viewedSource, setViewedSource] = React.useState<string | null>(null);

  const handleViewSource = React.useCallback(() => {
    const { code } = renderPageCode(dom, state.nodeId, { pretty: true });
    setViewedSource(code);
  }, [dom, state.nodeId]);

  const handleViewedSourceDialogClose = React.useCallback(() => setViewedSource(null), []);

  // To keep it around during closing animation
  const dialogSourceContent = useLatest(viewedSource);
  return (
    <div>
      <Stack spacing={1} alignItems="start">
        <Button
          startIcon={<PageIcon />}
          color="inherit"
          component="a"
          href={`/pages/${state.nodeId}`}
        >
          View Page
        </Button>
        <Button startIcon={<CodeIcon />} color="inherit" onClick={handleViewSource}>
          View Page Source
        </Button>
      </Stack>
      <Dialog fullWidth maxWidth="lg" onClose={handleViewedSourceDialogClose} open={!!viewedSource}>
        <DialogTitle>Page component</DialogTitle>
        <DialogContent>
          <pre>{dialogSourceContent}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const dom = useDom();
  const editor = usePageEditorState();

  const { selection } = editor;

  const selectedNode = selection ? studioDom.getNode(dom, selection) : null;

  return (
    <div className={className}>
      {selectedNode && studioDom.isElement(selectedNode) ? (
        // Add key to make sure it mounts every time selected node changes
        <SelectedNodeEditor key={selectedNode.id} node={selectedNode} />
      ) : (
        <DefaultPanel />
      )}
    </div>
  );
}
