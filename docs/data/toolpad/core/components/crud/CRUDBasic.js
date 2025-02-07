import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { CRUD } from '@toolpad/core/CRUD';
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

let notesStore = [];

export const notesDataSource = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'text', headerName: 'Text' },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredNotes = [...notesStore];

        // Apply filters
        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
              return;
            }

            filteredNotes = filteredNotes.filter((note) => {
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
          filteredNotes.sort((a, b) => {
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
        const paginatedNotes = filteredNotes.slice(start, end);

        resolve({
          items: paginatedNotes,
          itemCount: filteredNotes.length,
        });
      }, 1500);
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
      }, 1500);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNote = { id: notesStore.length + 1, ...data };

        notesStore = [...notesStore, newNote];

        resolve(newNote);
      }, 1500);
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
      }, 1500);
    });
  },
  deleteOne: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        notesStore = notesStore.filter((note) => note.id !== id);

        resolve();
      }, 1500);
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
      errors.status = 'Text is required';
    }

    return errors;
  },
};

function CRUDBasic(props) {
  const { window } = props;

  const router = useDemoRouter('/notes');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    return undefined;
  }, []);

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
          <CRUD
            dataSource={notesDataSource}
            rootPath="/notes"
            initialPageSize={25}
            defaultValues={{ itemCount: 1 }}
          />
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

CRUDBasic.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CRUDBasic;
