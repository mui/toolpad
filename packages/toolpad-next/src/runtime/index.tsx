import * as React from 'react';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { Box, Button, ButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import invariant from 'invariant';
import { WithDevtoolParams } from '../shared/types';
import DevtoolOverlay from './DevtoolOverlay';
import { ServerProvider } from './server';
import { ComponentInfo, CurrentComponentContext } from './CurrentComponentContext';

function useCurrentlyEditedComponentId() {
  return useStorageState('session', 'currently-edited-component-id', null);
}

const nextId = 1;

export function EditButton(props: ButtonProps) {
  const [currentEditedComponentId, setCurrentlyEditedComponentId] = useCurrentlyEditedComponentId();
  const componentInfo = React.useContext(CurrentComponentContext);

  invariant(componentInfo, `EditButton must be used inside a Component`);

  if (currentEditedComponentId) {
    return null;
  }

  return (
    <Button
      {...props}
      variant="contained"
      color="secondary"
      onClick={() => setCurrentlyEditedComponentId(componentInfo.id)}
      startIcon={<EditIcon />}
    >
      Edit
    </Button>
  );
}

export function withDevtool<P extends object>(
  Component: React.ComponentType<P>,
  { name, file, wsUrl }: WithDevtoolParams,
): React.ComponentType<P> {
  return function ComponentWithDevtool(props) {
    const [currentlyEditedComponentId, setCurrentlyEditedComponentId] =
      useCurrentlyEditedComponentId();

    const [id] = React.useState(() => {
      return `component-${nextId}`;
    });

    const editing = currentlyEditedComponentId === id;

    const componentInfo: ComponentInfo = React.useMemo(() => {
      return { id, name, file, props };
    }, [id, props]);

    return (
      <CurrentComponentContext.Provider value={componentInfo}>
        {editing ? (
          <ServerProvider wsUrl={wsUrl}>
            <Box
              sx={{
                display: 'contents',
                '> *': {
                  outlineColor: (theme) => theme.palette.secondary.main,
                  outlineStyle: 'solid',
                  outlineWidth: 2,
                },
              }}
            >
              <Component {...props} />
            </Box>
            <DevtoolOverlay
              name={name}
              file={file}
              onClose={() => setCurrentlyEditedComponentId(null)}
            />
          </ServerProvider>
        ) : (
          <Component {...props} />
        )}
      </CurrentComponentContext.Provider>
    );
  };
}
