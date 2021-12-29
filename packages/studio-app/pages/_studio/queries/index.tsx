import type { NextPage } from 'next';
import * as React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { LoadingButton } from '@mui/lab';
import StudioAppBar from '../../../src/components/StudioAppBar';
import client from '../../../src/api';
import { NextLinkComposed } from '../../../src/components/Link';
import { generateRandomId } from '../../../src/utils/randomId';

const CreateNewButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
}));

function CreateStudioQueryDialog({ onClose, ...props }: DialogProps) {
  const [connectionId, setConnectionID] = React.useState('');
  const router = useRouter();

  const connectionsQuery = useQuery('connections', client.query.getConnections);

  const queryClient = useQueryClient();
  const createQueryMutation = useMutation(client.mutation.addQuery, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('queries');
      router.push(`/_studio/queries/${encodeURIComponent(data.id)}`);
    },
  });

  const handleClose = React.useCallback(
    (event, reason) => {
      if (!createQueryMutation.isLoading) {
        onClose?.(event, reason);
      }
    },
    [onClose, createQueryMutation.isLoading],
  );

  const handleSelectionChange = React.useCallback((event: SelectChangeEvent<string>) => {
    setConnectionID(event.target.value);
  }, []);

  return (
    <Dialog {...props} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createQueryMutation.mutate({
            id: generateRandomId(),
            connectionId,
            query: {},
          });
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle>Create a new MUI Studio query</DialogTitle>
        <DialogContent>
          <Typography>Please select a connection for your query</Typography>
          <Select
            value={connectionId}
            labelId="select-connection"
            label="Connection"
            onChange={handleSelectionChange}
          >
            {(connectionsQuery.data || []).map(({ id, type, name }) => (
              <MenuItem key={id} value={id}>
                {name} | {type}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            type="submit"
            disabled={!connectionId}
            loading={createQueryMutation.isLoading}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const Home: NextPage = () => {
  const [createQueryDialogOpen, setCreateQueryDialogOpen] = React.useState(false);
  const handleCreateQueryDialogOpen = React.useCallback(() => setCreateQueryDialogOpen(true), []);
  const handleCreateQueryDialogClose = React.useCallback(() => setCreateQueryDialogOpen(false), []);

  const queriesQuery = useQuery('queries', client.query.getQueries);

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h2">Queries</Typography>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CreateNewButton onClick={handleCreateQueryDialogOpen}>Create New</CreateNewButton>
          </Grid>
          {queriesQuery.data?.map((query) => (
            <Grid
              item
              key={query.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ justifyContent: 'stretch' }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" />
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {query.id}
                  </Typography>
                  <Typography variant="body2">Last updated: {Date.now()}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={NextLinkComposed}
                    to={`/_studio/queries/${encodeURIComponent(query.id)}`}
                    size="small"
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <CreateStudioQueryDialog
        open={createQueryDialogOpen}
        onClose={handleCreateQueryDialogClose}
      />
    </div>
  );
};

export default Home;
