import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import { Box, Button, ButtonProps } from '@mui/material';
import { ToolpadFile } from '../shared/schemas';

function createGlobalState<T>(
  initialValue: T,
): [useState: () => T, setState: React.Dispatch<React.SetStateAction<T>>] {
  let state: T = initialValue;
  const emitter = new Emitter<{ change: {} }>();
  const subscribe = (cb: () => void) => emitter.subscribe('change', cb);
  const getSnapshot = () => state;
  return [
    () => React.useSyncExternalStore(subscribe, getSnapshot),
    (newState) => {
      state = typeof newState === 'function' ? (newState as (prevState: T) => T)(state) : newState;
      emitter.emit('change', {});
    },
  ];
}

const [useCurrentlyEditedComponentId, setCurrentlyEditedComponentId] = createGlobalState<
  string | null
>(null);

const CurrentComponentIdContext = React.createContext<string | null>(null);

const nextId = 1;

export function EditButton(props: ButtonProps) {
  const currentEditedComponentId = useCurrentlyEditedComponentId();
  const currentComponentId = React.useContext(CurrentComponentIdContext);

  if (currentEditedComponentId) {
    return null;
  }

  return (
    <Button
      {...props}
      variant="contained"
      onClick={() => setCurrentlyEditedComponentId(currentComponentId)}
    >
      Edit
    </Button>
  );
}

interface DevtoolOverlayProps {
  name: string;
  file: ToolpadFile;
}

function DevtoolOverlay({ name, file }: DevtoolOverlayProps) {
  const height = '50vh';

  React.useEffect(() => {
    const originalMarginBottom = document.body.style.marginBottom;
    document.body.style.marginBottom = height;
    return () => {
      document.body.style.marginBottom = originalMarginBottom;
    };
  }, [height]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        background: 'white',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {name} ({file.kind})<Button onClick={() => setCurrentlyEditedComponentId(null)}>Done</Button>
    </Box>
  );
}

export interface WithDevtoolParams {
  name: string;
  file: ToolpadFile;
}

export function withDevtool<P extends React.JSX.IntrinsicAttributes>(
  Component: React.ComponentType<P>,
  { name, file }: WithDevtoolParams,
): React.ComponentType<P> {
  return function ComponentWithDevtool(props) {
    const currentlyEditedComponentId = useCurrentlyEditedComponentId();

    const [editedComponentId] = React.useState(() => {
      return `component-${nextId}`;
    });

    const editing = currentlyEditedComponentId === editedComponentId;

    return (
      <CurrentComponentIdContext.Provider value={editedComponentId}>
        {editing ? (
          <React.Fragment>
            <Component {...props} />
            <DevtoolOverlay name={name} file={file} />
          </React.Fragment>
        ) : (
          <Component {...props} />
        )}
      </CurrentComponentIdContext.Provider>
    );
  } satisfies React.ComponentType<P>;
}
