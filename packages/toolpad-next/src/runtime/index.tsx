import * as React from 'react';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { Box, Button, ButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import invariant from 'invariant';
import { WithDevtoolParams } from '../shared/types';
import DevtoolOverlay from './DevtoolOverlay';
import { ServerProvider, useServer } from './server';
import { ComponentInfo, CurrentComponentContext } from './CurrentComponentContext';
import * as probes from './probes';
import { getComponentNameFromInputFile, getOutputPathForInputFile } from '../shared/paths';
import { generateComponent } from '../shared/codeGeneration';
import { evaluate } from './vm';

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

function DefaultComponent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <EditButton />
    </Box>
  );
}

interface EditableComponentProps<P> {
  InitialComponent?: React.ComponentType<P>;
  config: WithDevtoolParams;
  open?: boolean;
  onClose?: () => void;
  props: P;
}

export function EditableComponent<P extends object>({
  InitialComponent = DefaultComponent,
  config,
  open,
  onClose,
  props,
}: EditableComponentProps<P>) {
  const { filePath, file, dependencies } = config;
  const name = getComponentNameFromInputFile(filePath);

  const [fileInput, setFileInput] = React.useState(file);
  React.useEffect(() => setFileInput(file), [file]);

  const [RenderedComponent, setRenderedComponent] = React.useState<React.ComponentType<P>>(
    () => InitialComponent,
  );

  const handleComponentUpdate = React.useCallback((NewComponent: React.ComponentType<any>) => {
    setRenderedComponent(() => NewComponent);
  }, []);

  React.useEffect(() => {
    const outDir = '/';
    generateComponent(filePath, fileInput, { target: 'preview', outDir })
      .then(async (result) => {
        const resolvedDependencies = await Promise.all(
          dependencies.map(
            async ([k, v]) => [k, { exports: await v() }] satisfies [string, unknown],
          ),
        );

        const outputPath = getOutputPathForInputFile(filePath, outDir);

        const moduleExports = await evaluate(
          new Map(result.files),
          outputPath,
          new Map(resolvedDependencies),
        );

        const NewComponent = (moduleExports as any)?.default as React.ComponentType<P>;
        invariant(
          typeof NewComponent === 'function',
          `Compilation must result in a function as default export`,
        );
        setRenderedComponent(() => NewComponent);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [filePath, dependencies, fileInput]);

  const server = useServer();

  const handleCommit = React.useCallback(() => {
    server.saveFile(name, fileInput).then(() => onClose?.());
  }, [name, onClose, fileInput, server]);

  return open ? (
    <React.Fragment>
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
        value={fileInput}
        onChange={setFileInput}
        dependencies={dependencies}
        onClose={onClose}
        onCommit={handleCommit}
        onComponentUpdate={handleComponentUpdate}
      />
    </React.Fragment>
  ) : (
    <InitialComponent {...props} />
  );
}

export function withDevtool<P extends object>(
  Component: React.ComponentType<P>,
  config: WithDevtoolParams,
): React.ComponentType<P> {
  const { filePath, file, wsUrl } = config;
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

    return (
      <CurrentComponentContext.Provider value={componentInfo}>
        <ServerProvider wsUrl={wsUrl}>
          <EditableComponent
            config={config}
            InitialComponent={Component}
            open={editing}
            onClose={() => {
              setCurrentlyEditedComponentId(null);
            }}
            props={props}
          />
        </ServerProvider>
      </CurrentComponentContext.Provider>
    );
  };
}
