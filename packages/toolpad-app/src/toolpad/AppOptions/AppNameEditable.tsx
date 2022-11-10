import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import type { AppMeta } from '../../server/data';
import EditableText from '../../components/EditableText';
import client from '../../api';

interface AppNameEditableProps {
  app?: AppMeta;
  editing?: boolean;
  setEditing: (editing: boolean) => void;
  loading?: boolean;
  existingAppNames?: string[];
}

const AppNameEditable = ({
  app,
  editing,
  setEditing,
  loading,
  existingAppNames,
}: AppNameEditableProps) => {
  const appNameInput = React.useRef<HTMLInputElement | null>(null);
  const [appName, setAppName] = React.useState<string>(app?.name || '');

  const handleAppNameChange = React.useCallback(
    (newValue: string) => {
      setAppName(newValue);
    },
    [setAppName],
  );

  const existingNames = React.useMemo(() => new Set(existingAppNames), [existingAppNames]);

  const nameError = React.useMemo(() => {
    if (editing && appName !== app?.name && existingNames.has(appName)) {
      return 'An app with that name already exists.';
    }
    return null;
  }, [editing, existingNames, appName, app?.name]);

  const handleAppRenameClose = React.useCallback(() => {
    setEditing(false);
  }, [setEditing]);

  const handleAppRenameSave = React.useCallback(
    async (name: string) => {
      if (nameError) {
        setEditing(true);
        return;
      }
      if (app?.id) {
        try {
          await client.mutation.updateApp(app.id, { name });
          await client.invalidateQueries('getApps');
        } catch (rawError) {
          existingNames.add(name);
          setEditing(true);
        }
      }
    },
    [app?.id, setEditing, nameError, existingNames],
  );

  return loading ? (
    <Skeleton />
  ) : (
    <EditableText
      defaultValue={app?.name}
      editable={editing}
      helperText={nameError}
      error={!!nameError}
      onChange={handleAppNameChange}
      onClose={handleAppRenameClose}
      onSave={handleAppRenameSave}
      ref={appNameInput}
      sx={{
        width: '100%',
      }}
      value={appName}
      variant="subtitle1"
    />
  );
};

export default AppNameEditable;
