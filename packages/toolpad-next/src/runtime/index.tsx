import * as React from 'react';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { Box, Button, ButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import invariant from 'invariant';
import { WithDevtoolParams } from '../shared/types';
import DevtoolOverlay from './DevtoolOverlay';
import { ServerProvider } from './server';
import { ComponentInfo, CurrentComponentContext } from './CurrentComponentContext';
import * as probes from './probes';
import { getComponentNameFromInputFile } from '../shared/paths';

export { probes };

function useCurrentlyEditedComponentId() {
  const [currentEditedComponentId, setCurrentlyEditedComponentId] = useStorageState(
    'session',
    'currently-edited-component-id',
    null,
  );
  const handleEditedComponentIdChange: React.Dispatch<React.SetStateAction<string | null>> =
    React.useCallback(
      (value) => {
        probes.reset();
        setCurrentlyEditedComponentId(value);
      },
      [setCurrentlyEditedComponentId],
    );
  return [currentEditedComponentId, handleEditedComponentIdChange] as const;
}

let nextId = 1;

export function EditButton(props: ButtonProps) {
  const [currentEditedComponentId, setCurrentlyEditedComponentId] = useCurrentlyEditedComponentId();
  const componentInfo = React.useContext(CurrentComponentContext);

  invariant(componentInfo, `EditButton must be used inside a Component`);

  if (currentEditedComponentId === componentInfo.id) {
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
  { filePath, file, wsUrl, dependencies }: WithDevtoolParams,
): React.ComponentType<P> {
  const name = getComponentNameFromInputFile(filePath);

  return function ComponentWithDevtool(props) {
    const [currentlyEditedComponentId, setCurrentlyEditedComponentId] =
      useCurrentlyEditedComponentId();

    const [id] = React.useState(() => {
      // Using this over React.useId() as this is more stable across page reloads
      const newId = `component-${nextId}`;
      nextId += 1;
      return newId;
    });

    const editing = currentlyEditedComponentId === id;

    const componentInfo: ComponentInfo = React.useMemo(() => {
      return { id, name, file, props };
    }, [id, props]);

    const [RenderedComponent, setRenderedComponent] = React.useState<React.ComponentType<P>>(
      () => Component,
    );

    const handleComponentUpdate = React.useCallback((NewComponent: React.ComponentType<any>) => {
      setRenderedComponent(() => NewComponent);
    }, []);

    React.useEffect(() => {
      if (!editing) {
        setRenderedComponent(() => Component);
      }
    }, [editing]);

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
              <RenderedComponent {...props} />
            </Box>
            <DevtoolOverlay
              filePath={filePath}
              file={file}
              dependencies={dependencies}
              onClose={() => {
                setCurrentlyEditedComponentId(null);
              }}
              onCommitted={() => {
                setCurrentlyEditedComponentId(null);
              }}
              onComponentUpdate={handleComponentUpdate}
            />
          </ServerProvider>
        ) : (
          <RenderedComponent {...props} />
        )}
      </CurrentComponentContext.Provider>
    );
  };
}
