import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import {
  Create,
  CrudProvider,
  DataSourceCache,
  Edit,
  List,
  Show,
} from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
  {
    segment: 'notes',
    title: 'Notes',
    icon: <StickyNote2Icon />,
    pattern: 'notes{/:noteId}*',
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

let notesStore = [
  { id: 1, title: 'Grocery List Item', text: 'Buy more coffee.' },
  { id: 2, title: 'Personal Goal', text: 'Finish reading the book.' },
];

export const notesDataSource = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'text', headerName: 'Text', flex: 1 },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let processedNotes = [...notesStore];

        // Apply filters (demo only)
        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
              return;
            }

            processedNotes = processedNotes.filter((note) => {
              const noteValue = note[field];

              switch (operator) {
                case 'contains':
                  return String(noteValue)
                    .toLowerCase()
                    .includes(String(value).toLowerCase());
                case 'equals':
                  return noteValue === value;
                case 'startsWith':
                  return String(noteValue)
                    .toLowerCase()
                    .startsWith(String(value).toLowerCase());
                case 'endsWith':
                  return String(noteValue)
                    .toLowerCase()
                    .endsWith(String(value).toLowerCase());
                case '>':
                  return noteValue > value;
                case '<':
                  return noteValue < value;
                default:
                  return true;
              }
            });
          });
        }

        // Apply sorting
        if (sortModel?.length) {
          processedNotes.sort((a, b) => {
            for (const { field, sort } of sortModel) {
              if (a[field] < b[field]) {
                return sort === 'asc' ? -1 : 1;
              }
              if (a[field] > b[field]) {
                return sort === 'asc' ? 1 : -1;
              }
            }
            return 0;
          });
        }

        // Apply pagination
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const paginatedNotes = processedNotes.slice(start, end);

        resolve({
          items: paginatedNotes,
          itemCount: processedNotes.length,
        });
      }, 750);
    });
  },
  getOne: (noteId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const noteToShow = notesStore.find((note) => note.id === Number(noteId));

        if (noteToShow) {
          resolve(noteToShow);
        } else {
          reject(new Error('Note not found'));
        }
      }, 750);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNote = { id: notesStore.length + 1, ...data };

        notesStore = [...notesStore, newNote];

        resolve(newNote);
      }, 750);
    });
  },
  updateOne: (noteId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedNote = null;

        notesStore = notesStore.map((note) => {
          if (note.id === Number(noteId)) {
            updatedNote = { ...note, ...data };
            return updatedNote;
          }
          return note;
        });

        if (updatedNote) {
          resolve(updatedNote);
        } else {
          reject(new Error('Note not found'));
        }
      }, 750);
    });
  },
  deleteOne: (noteId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        notesStore = notesStore.filter((note) => note.id !== Number(noteId));

        resolve();
      }, 750);
    });
  },
  validate: (formValues) => {
    const errors = {};

    if (!formValues.title) {
      errors.title = 'Title is required';
    }
    if (formValues.title && formValues.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (!formValues.text) {
      errors.text = 'Text is required';
    }

    return errors;
  },
};

const notesCache = new DataSourceCache();

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function CrudAdvanced(props) {
  const { window } = props;

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const rootPath = '/notes';

  const router = useDemoRouter(rootPath);

  const listPath = rootPath;
  const showPath = `${rootPath}/:noteId`;
  const createPath = `${rootPath}/new`;
  const editPath = `${rootPath}/:noteId/edit`;

  const title = React.useMemo(() => {
    if (router.pathname === createPath) {
      return 'New Note';
    }
    const editNoteId = matchPath(editPath, router.pathname);
    if (editNoteId) {
      return `Note ${editNoteId} - Edit`;
    }
    const showNoteId = matchPath(showPath, router.pathname);
    if (showNoteId) {
      return `Note ${showNoteId}`;
    }

    return undefined;
  }, [createPath, editPath, router.pathname, showPath]);

  const handleRowClick = React.useCallback(
    (noteId) => {
      router.navigate(`${rootPath}/${String(noteId)}`);
    },
    [router],
  );

  const handleCreateClick = React.useCallback(() => {
    router.navigate(createPath);
  }, [createPath, router]);

  const handleEditClick = React.useCallback(
    (noteId) => {
      router.navigate(`${rootPath}/${String(noteId)}/edit`);
    },
    [router],
  );

  const handleCreate = React.useCallback(() => {
    router.navigate(listPath);
  }, [listPath, router]);

  const handleEdit = React.useCallback(() => {
    router.navigate(listPath);
  }, [listPath, router]);

  const handleDelete = React.useCallback(() => {
    router.navigate(listPath);
  }, [listPath, router]);

  const showNoteId = matchPath(showPath, router.pathname);
  const editNoteId = matchPath(editPath, router.pathname);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title={title}>
          {/* preview-start */}
          <CrudProvider dataSource={notesDataSource} dataSourceCache={notesCache}>
            {router.pathname === listPath ? (
              <List
                initialPageSize={10}
                onRowClick={handleRowClick}
                onCreateClick={handleCreateClick}
                onEditClick={handleEditClick}
              />
            ) : null}
            {router.pathname === createPath ? (
              <Create
                initialValues={{ title: 'New note' }}
                onSubmitSuccess={handleCreate}
                resetOnSubmit={false}
              />
            ) : null}
            {router.pathname !== createPath && showNoteId ? (
              <Show
                id={showNoteId}
                onEditClick={handleEditClick}
                onDelete={handleDelete}
              />
            ) : null}
            {editNoteId ? (
              <Edit id={editNoteId} onSubmitSuccess={handleEdit} />
            ) : null}
          </CrudProvider>
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

CrudAdvanced.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CrudAdvanced;
