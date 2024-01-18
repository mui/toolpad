import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { Stack, Chip, Tab, IconButton } from '@mui/material';
import { LoadingButton, TabList, TabContext, TabPanel } from '@mui/lab';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { useAppState, useAppStateApi } from '../../../AppState';
import { usePageEditorState } from '../PageEditorProvider';
import * as appDom from '../../../../appDom';
import QueryIcon from '../../QueryIcon';
import QueryEditorPanel from './QueryEditorPanel';
import useShortcut from '../../../../utils/useShortcut';
import { getModifierKey } from '../../../../utils/platform';
import useUnsavedChangesConfirm from '../../../hooks/useUnsavedChangesConfirm';

function SaveShortcutIndicator() {
  return (
    <span>
      {getModifierKey()}+<kbd>S</kbd>
    </span>
  );
}

function TabCloseIcon({
  queryIndex,
  unsaved,
  queryId,
}: {
  queryIndex: number;
  unsaved?: boolean;
  queryId?: NodeId;
}) {
  const appStateApi = useAppStateApi();

  const [notHovered, setNotHovered] = React.useState(true);

  const onClose = React.useCallback(() => {
    if (queryId === undefined) {
      return;
    }
    appStateApi.closeQueryTab(queryId, queryIndex);
  }, [appStateApi, queryIndex, queryId]);

  const { handleCloseWithUnsavedChanges: handleCloseTab } = useUnsavedChangesConfirm({
    hasUnsavedChanges: unsaved ?? false,
    onClose,
  });
  return unsaved && notHovered ? (
    <CircleIcon
      aria-label={`Unsaved changes ${queryIndex + 1}`}
      sx={{
        color: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.primaryDark[300]
            : theme.palette.primary.main,
        fontSize: 12,
      }}
      onMouseEnter={() => {
        setNotHovered(false);
      }}
    />
  ) : (
    <ClearOutlinedIcon
      onMouseLeave={() => {
        setNotHovered(true);
      }}
      onClick={(event) => {
        // Prevent the tab from being selected.
        event.stopPropagation();
        handleCloseTab();
      }}
      role="button"
      aria-label={`Close query tab ${queryIndex + 1}`}
      sx={{
        color: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.primaryDark[400] : theme.palette.grey[500],
        fontSize: 12,
        padding: '1px',
        '&:hover': {
          color: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.primaryDark[300]
              : theme.palette.grey[700],
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.primaryDark[700]
              : theme.palette.grey[300],
          borderRadius: '4px',
        },
      }}
    />
  );
}

export default function QueryEditor() {
  const { currentView, dom } = useAppState();

  const appStateApi = useAppStateApi();
  const state = usePageEditorState();

  const page = appDom.getNode(dom, state.nodeId, 'page');

  const currentQueryId = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.view.nodeId;
    }
    return '';
  }, [currentView]);

  const currentTabIndex: string = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.queryPanel?.currentTabIndex?.toString() || '';
    }
    return '';
  }, [currentView]);

  const handleTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      if (currentView.kind === 'page') {
        const tabIndex = Number(newValue);
        const queryId = currentView.queryPanel?.queryTabs?.[tabIndex]?.meta?.id;
        if (queryId) {
          appStateApi.setView({
            kind: 'page',
            name: page.name,
            view: { kind: 'query', nodeId: queryId },
            queryPanel: {
              ...currentView.queryPanel,
              currentTabIndex: tabIndex,
            },
          });
        }
      }
    },
    [appStateApi, currentView, page.name],
  );

  const hasUnsavedChanges = React.useCallback(
    (queryIndex: number) => {
      if (
        currentView.kind !== 'page' ||
        !currentView.name ||
        !currentView.queryPanel?.queryTabs ||
        queryIndex === undefined
      ) {
        return false;
      }
      const tab = currentView.queryPanel?.queryTabs[queryIndex];
      const draft = tab?.draft;
      if (!tab || !tab.meta?.id || !draft) {
        return false;
      }
      return draft !== tab.saved;
    },
    [currentView],
  );

  const handleSave = React.useCallback(() => {
    if (
      currentView.kind !== 'page' ||
      !currentView.name ||
      !currentView.queryPanel?.queryTabs ||
      currentView.queryPanel?.currentTabIndex === undefined
    ) {
      return;
    }
    const currentTab = currentView.queryPanel?.queryTabs[currentView.queryPanel?.currentTabIndex];
    const currentQueryDraft = currentTab?.draft;
    if (!currentTab || !currentTab.meta?.id || !currentQueryDraft) {
      return;
    }
    appStateApi.saveQueryDraft(currentQueryDraft);
  }, [currentView, appStateApi]);

  const onClosePanel = React.useCallback(() => {
    appStateApi.closeQueryPanel();
  }, [appStateApi]);

  const saveDisabled = React.useMemo(
    () => !hasUnsavedChanges(Number(currentTabIndex)),
    [hasUnsavedChanges, currentTabIndex],
  );

  const hasUnsavedChangesInPanel = React.useMemo(() => {
    if (currentView.kind !== 'page' || !currentView.queryPanel?.queryTabs) {
      return false;
    }
    return currentView.queryPanel?.queryTabs.some((tab) => tab.draft !== tab.saved);
  }, [currentView]);

  const { handleCloseWithUnsavedChanges: handleClosePanel } = useUnsavedChangesConfirm({
    hasUnsavedChanges: hasUnsavedChangesInPanel,
    onClose: onClosePanel,
  });

  useShortcut({ key: 's', metaKey: true, disabled: saveDisabled }, handleSave);

  return currentView.kind === 'page' &&
    currentView.view?.kind === 'query' &&
    currentQueryId &&
    currentView?.queryPanel?.queryTabs ? (
    <Stack
      direction="column"
      sx={{ height: '100%', overflow: 'hidden', borderBottom: 5, borderColor: 'divider' }}
      aria-label="Query editor"
      role="tabpanel"
    >
      <TabContext value={currentTabIndex}>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          sx={{ maxHeight: 36, borderBottom: 1, borderColor: 'divider' }}
        >
          <TabList onChange={handleTabChange} aria-label="Query editor tabs">
            {currentView.queryPanel?.queryTabs?.map((query, index) => (
              <Tab
                key={index}
                label={
                  <Chip
                    label={query?.meta?.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: 'inherit',
                      border: 0,
                      ml: -1,
                      '&:hover': { color: 'inherit' },
                    }}
                    deleteIcon={
                      <TabCloseIcon
                        queryIndex={index}
                        unsaved={hasUnsavedChanges(index)}
                        queryId={query?.meta?.id}
                      />
                    }
                    // Need to pass onDelete to allow the delete icon to be rendered
                    onDelete={() => {}}
                  />
                }
                value={index.toString()}
                icon={
                  <QueryIcon
                    id={query?.meta?.dataSource || 'default'}
                    mode={query?.meta?.mode ?? 'query'}
                    sx={{ mt: 0.2 }}
                  />
                }
                iconPosition="start"
              />
            ))}
          </TabList>
          <div>
            <LoadingButton
              disabled={saveDisabled}
              onClick={handleSave}
              variant="contained"
              color="primary"
              sx={{ width: 'fit-content', height: 32, my: 'auto', mt: 0.2, mr: 2 }}
            >
              Save &nbsp;
              <SaveShortcutIndicator />
            </LoadingButton>
            <IconButton size="small" disableRipple onClick={handleClosePanel}>
              <CancelPresentationIcon
                sx={{
                  mr: 1,
                  alignSelf: 'center',
                  color: (theme) => theme.palette.grey[500],
                  transition: (theme) =>
                    theme.transitions.create('color', {
                      duration: theme.transitions.duration.shortest,
                    }),
                  '&:hover, &:focus': {
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.primaryDark[300]
                        : theme.palette.primary.main,
                  },
                  fontSize: 16,
                }}
              />
            </IconButton>
          </div>
        </Stack>

        {currentView.queryPanel?.queryTabs?.map((query, index) => {
          if (query && query.draft) {
            return (
              <TabPanel
                key={index}
                value={index.toString()}
                aria-label={query.meta?.name}
                sx={{
                  p: 0,
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <QueryEditorPanel draft={query.draft} saved={query.saved} />
              </TabPanel>
            );
          }
          return null;
        })}
      </TabContext>
    </Stack>
  ) : null;
}
