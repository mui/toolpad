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
  FormControl,
  Grid,
  InputLabel,
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

function CreateStudioApiDialog({ onClose, ...props }: DialogProps) {
  const [connectionId, setConnectionID] = React.useState('');
  const router = useRouter();

  const connectionsQuery = useQuery('connections', client.query.getConnections);

  const queryClient = useQueryClient();
  const createApiMutation = useMutation(client.mutation.addApi);

  const handleClose = React.useCallback(
    (event, reason) => {
      if (!createApiMutation.isLoading) {
        onClose?.(event, reason);
      }
    },
    [onClose, createApiMutation.isLoading],
  );

  const handleSelectionChange = React.useCallback((event: SelectChangeEvent<string>) => {
    setConnectionID(event.target.value);
  }, []);

  return (
    <Dialog {...props} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createApiMutation.mutate(
            {
              // TODO: move ID generation serverside
              id: generateRandomId(),
              // TODO: move name generation serverside and ensure uniqueness
              name: 'Dummy Name',
              connectionId,
              query: {},
            },
            {
              onSuccess: (data) => {
                queryClient.invalidateQueries('apis');
                router.push(`/_studio/apis/${encodeURIComponent(data.id)}`);
              },
            },
          );
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
          <LoadingButton
            type="submit"
            disabled={!connectionId}
            loading={createApiMutation.isLoading}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const Home: NextPage = () => {
  const [createApiDialogOpen, setCreateApiDialogOpen] = React.useState(false);
  const handleCreateApiDialogOpen = React.useCallback(() => setCreateApiDialogOpen(true), []);
  const handleCreateApiDialogClose = React.useCallback(() => setCreateApiDialogOpen(false), []);

  const apisQuery = useQuery('apis', client.query.getApis);

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <Typography variant="h2">Apis</Typography>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CreateNewButton onClick={handleCreateApiDialogOpen}>Create New</CreateNewButton>
          </Grid>
          {apisQuery.data?.map((api) => (
            <Grid item key={api.id} xs={12} sm={6} md={4} lg={3} sx={{ justifyContent: 'stretch' }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {api.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {api.id}
                  </Typography>
                  <Typography variant="body2">Last updated: {Date.now()}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={NextLinkComposed}
                    to={`/_studio/apis/${encodeURIComponent(api.id)}`}
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
      <CreateStudioApiDialog open={createApiDialogOpen} onClose={handleCreateApiDialogClose} />
    </div>
  );
};

export default Home;
