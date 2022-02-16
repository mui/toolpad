import { TreeView } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  styled,
  Box,
  IconButton,
} from '@mui/material';
import * as React from 'react';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { NodeId } from '../../types';
import * as studioDom from '../../studioDom';
import { useDom, useDomApi } from '../DomLoader';
import client from '../../api';
import { format } from '../../utils/prettier';

const HierarchyExplorerRoot = styled('div')({
  overflow: 'auto',
  width: '100%',
});

type StyledTreeItemProps = TreeItemProps & {
  onDelete?: React.MouseEventHandler;
  onCreate?: React.MouseEventHandler;
  labelIcon?: React.ReactNode;
  labelText: string;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const { labelIcon, labelText, onCreate, onDelete, ...other } = props;

  return (
    <TreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          {labelIcon}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          {onCreate ? (
            <IconButton size="small" onClick={onCreate}>
              <AddIcon fontSize="small" />
            </IconButton>
          ) : null}
          {onDelete ? (
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

interface CreateStudioApiDialogProps extends Pick<DialogProps, 'open' | 'onClose'> {}

function CreateStudioApiDialog({ onClose, ...props }: CreateStudioApiDialogProps) {
  const [connectionId, setConnectionID] = React.useState('');
  const dom = useDom();
  const domApi = useDomApi();
  const navigate = useNavigate();

  const connectionsQuery = useQuery('connections', client.query.getConnections);

  const handleSelectionChange = React.useCallback((event: SelectChangeEvent<string>) => {
    setConnectionID(event.target.value);
  }, []);

  return (
    <Dialog {...props} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const connectionType = (connectionsQuery.data || []).find(
            ({ id }) => id === connectionId,
          )?.type;
          if (!connectionType) {
            throw new Error(
              `Invariant: can't find a datasource for existing connection "${connectionId}"`,
            );
          }
          const newApiNode = studioDom.createNode(dom, 'api', {
            query: {},
            connectionId,
            connectionType,
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newApiNode, appNode, 'apis');
          onClose?.(e, 'backdropClick');
          navigate(`/apis/${newApiNode.id}`);
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle>Create a new MUI Studio API</DialogTitle>
        <DialogContent>
          <Typography>Please select a connection for your API</Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id="select-connection-type">Connection</InputLabel>
            <Select
              size="small"
              fullWidth
              value={connectionId}
              labelId="select-connection-type"
              label="Connection"
              onChange={handleSelectionChange}
            >
              {(connectionsQuery.data || []).map(({ id, type, name }) => (
                <MenuItem key={id} value={id}>
                  {name} | {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={!connectionId}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

interface CreateStudioPageDialogProps extends Pick<DialogProps, 'open' | 'onClose'> {}

function CreateStudioPageDialog({ onClose, ...props }: CreateStudioPageDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const [title, setTitle] = React.useState('');
  const navigate = useNavigate();

  return (
    <Dialog {...props} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newNode = studioDom.createNode(dom, 'page', {
            title,
            urlQuery: {},
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newNode, appNode, 'pages');
          onClose?.(e, 'backdropClick');
          navigate(`/pages/${newNode.id}`);
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle>Create a new MUI Studio API</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            autoFocus
            fullWidth
            label="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={!title}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function createDefaultCodeComponent(name: string): string {
  const componentId = name.replace(/\s/g, '');
  const propTypeId = `${componentId}Props`;
  return format(`
    import * as React from 'react';
    import type { ComponentConfig } from "@mui/studio-core";
    
    export interface ${propTypeId} {
      msg: string;
    }
    
    export const config: ComponentConfig<${propTypeId}> = {
      argTypes: {}
    }
    
    export default function ${componentId}({ msg }: ${propTypeId}) {
      return (
        <div>{msg}</div>
      );
    }

    ${componentId}.defaultProps = {
      msg: "Hello world!",
    };
  `);
}

interface CreateStudioCodeComponentDialogProps extends Pick<DialogProps, 'open' | 'onClose'> {}

function CreateStudioCodeComponentDialog({
  onClose,
  ...props
}: CreateStudioCodeComponentDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const [name, setName] = React.useState(`MyComponent`);
  const navigate = useNavigate();

  return (
    <Dialog {...props} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('name', name);
          const newNode = studioDom.createNode(dom, 'codeComponent', {
            name,
            code: createDefaultCodeComponent(name),
            argTypes: {},
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newNode, appNode, 'codeComponents');
          onClose?.(e, 'backdropClick');
          navigate(`/codeComponents/${newNode.id}`);
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle>Create a new MUI Studio Code Component</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            autoFocus
            fullWidth
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={!name}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export interface HierarchyExplorerProps {
  className?: string;
}

// TODO:
export default function HierarchyExplorer({ className }: HierarchyExplorerProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const app = studioDom.getApp(dom);
  const { apis = [], codeComponents = [], pages = [] } = studioDom.getChildNodes(dom, app);

  const [expanded, setExpanded] = React.useState<string[]>([':pages', ':apis', ':codeComponents']);

  const selected: NodeId[] = [];

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds as NodeId[]);
  };

  const navigate = useNavigate();

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    if (nodeIds.length <= 0) {
      return;
    }

    const rawNodeId = nodeIds[0];
    if (rawNodeId.startsWith(':')) {
      return;
    }

    const studioNodeId: NodeId = rawNodeId as NodeId;
    const node = studioDom.getNode(dom, studioNodeId);
    if (studioDom.isElement(node)) {
      // TODO: sort out in-page selection
      const page = studioDom.getPageAncestor(dom, node);
      if (page) {
        navigate(`/pages/${page.id}`);
      }
    }

    if (studioDom.isPage(node)) {
      navigate(`/pages/${node.id}`);
    }

    if (studioDom.isApi(node)) {
      navigate(`/apis/${node.id}`);
    }

    if (studioDom.isCodeComponent(node)) {
      navigate(`/codeComponents/${node.id}`);
    }
  };

  const [createApiDialogOpen, setCreateApiDialogOpen] = React.useState(0);
  const handleCreateApiDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateApiDialogOpen(Math.random());
  }, []);
  const handleCreateApiDialogClose = React.useCallback(() => setCreateApiDialogOpen(0), []);

  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreatePageDialogOpen(Math.random());
  }, []);
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);

  const [createCodeComponentDialogOpen, setCreateCodeComponentDialogOpen] = React.useState(0);
  const handleCreateCodeComponentDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateCodeComponentDialogOpen(Math.random());
  }, []);
  const handleCreateCodeComponentDialogClose = React.useCallback(
    () => setCreateCodeComponentDialogOpen(0),
    [],
  );

  const [deletedNode, setDeletedNode] = React.useState<NodeId | null>(null);
  const handleDeleteNodeDialogOpen = React.useCallback(
    (nodeId: NodeId) => (event: React.MouseEvent) => {
      event.stopPropagation();
      setDeletedNode(nodeId);
    },
    [],
  );
  const handledeleteNodeDialogClose = React.useCallback(() => setDeletedNode(null), []);

  const handleDeleteNode = React.useCallback(() => {
    if (deletedNode) {
      domApi.removeNode(deletedNode);
      handledeleteNodeDialogClose();
    }
  }, [domApi, deletedNode, handledeleteNodeDialogClose]);

  return (
    <HierarchyExplorerRoot className={className}>
      <Typography sx={{ px: 1, pt: 2 }}>App Hierarchy:</Typography>
      <TreeView
        aria-label="hierarchy explorer"
        selected={selected}
        onNodeSelect={handleSelect}
        expanded={expanded}
        onNodeToggle={handleToggle}
        multiSelect
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <HierarchyTreeItem nodeId=":apis" labelText="Apis" onCreate={handleCreateApiDialogOpen}>
          {apis.map((apiNode) => (
            <HierarchyTreeItem
              key={apiNode.id}
              nodeId={apiNode.id}
              labelText={apiNode.name}
              onDelete={handleDeleteNodeDialogOpen(apiNode.id)}
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem
          nodeId=":codeComponents"
          labelText="Components"
          onCreate={handleCreateCodeComponentDialogOpen}
        >
          {codeComponents.map((codeComponent) => (
            <HierarchyTreeItem
              key={codeComponent.id}
              nodeId={codeComponent.id}
              labelText={codeComponent.name}
              onDelete={handleDeleteNodeDialogOpen(codeComponent.id)}
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem nodeId=":pages" labelText="Pages" onCreate={handleCreatePageDialogOpen}>
          {pages.map((page) => (
            <HierarchyTreeItem
              key={page.id}
              nodeId={page.id}
              labelText={page.name}
              onDelete={handleDeleteNodeDialogOpen(page.id)}
            />
          ))}
        </HierarchyTreeItem>
      </TreeView>

      <CreateStudioApiDialog
        key={createApiDialogOpen || undefined}
        open={!!createApiDialogOpen}
        onClose={handleCreateApiDialogClose}
      />
      <CreateStudioPageDialog
        key={createPageDialogOpen || undefined}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
      <CreateStudioCodeComponentDialog
        key={createCodeComponentDialogOpen || undefined}
        open={!!createCodeComponentDialogOpen}
        onClose={handleCreateCodeComponentDialogClose}
      />
      <Dialog open={!!deletedNode} onClose={handledeleteNodeDialogClose}>
        <DialogTitle>Delete node {deletedNode}</DialogTitle>
        <DialogActions>
          <Button type="submit" onClick={handledeleteNodeDialogClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleDeleteNode}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </HierarchyExplorerRoot>
  );
}
