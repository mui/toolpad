import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION: Navigation = [
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

export interface Note extends DataModel {
  id: number;
  title: string;
  text: string;
  createdAt: string;
}

let notesStore: Note[] = [
  {
    id: 1,
    title: 'Grocery List Item',
    text: 'Buy more coffee.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Personal Goal',
    text: 'Finish reading the book.',
    createdAt: new Date().toISOString(),
  },
];

// preview-start
export const notesDataSource: DataSource<Note> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'text', headerName: 'Text', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Created at',
      type: 'dateTime',
      valueGetter: (value: string) => value && new Date(value),
      editable: false,
    },
  ],
  // preview-end
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

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
              return (noteValue as number) > value;
            case '<':
              return (noteValue as number) < value;
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
          if ((a[field] as number) < (b[field] as number)) {
            return sort === 'asc' ? -1 : 1;
          }
          if ((a[field] as number) > (b[field] as number)) {
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

    return {
      items: paginatedNotes,
      itemCount: processedNotes.length,
    };
  },

  getOne: async (noteId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const noteToShow = notesStore.find((note) => note.id === Number(noteId));

    if (!noteToShow) {
      throw new Error('Note not found');
    }
    return noteToShow;
  },

  createOne: async (data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const newNote = {
      id: notesStore.reduce((max, note) => Math.max(max, note.id), 0) + 1,
      createdAt: new Date().toISOString(),
      ...data,
    } as Note;

    notesStore = [...notesStore, newNote];

    return newNote;
  },

  updateOne: async (noteId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let updatedNote: Note | null = null;

    notesStore = notesStore.map((note) => {
      if (note.id === Number(noteId)) {
        updatedNote = { ...note, ...data };
        return updatedNote;
      }
      return note;
    });

    if (!updatedNote) {
      throw new Error('Note not found');
    }
    return updatedNote;
  },

  deleteOne: async (noteId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    notesStore = notesStore.filter((note) => note.id !== Number(noteId));
  },

  validate: (formValues) => {
    let issues: { message: string; path: [keyof Note] }[] = [];

    if (!formValues.title) {
      issues = [...issues, { message: 'Title is required', path: ['title'] }];
    }

    if (formValues.title && formValues.title.length < 3) {
      issues = [
        ...issues,
        {
          message: 'Title must be at least 3 characters long',
          path: ['title'],
        },
      ];
    }

    if (!formValues.text) {
      issues = [...issues, { message: 'Text is required', path: ['text'] }];
    }

    return { issues };
  },
};

const notesCache = new DataSourceCache();

function matchPath(pattern: string, pathname: string): string | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function CrudNonEditableFields(props: DemoProps) {
  const { window } = props;

  const router = useDemoRouter('/notes');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === '/notes/new') {
      return 'New Note';
    }
    const editNoteId = matchPath('/notes/:noteId/edit', router.pathname);
    if (editNoteId) {
      return `Note ${editNoteId} - Edit`;
    }
    const showNoteId = matchPath('/notes/:noteId', router.pathname);
    if (showNoteId) {
      return `Note ${showNoteId}`;
    }

    return undefined;
  }, [router.pathname]);

  return (
    // Remove this provider when copying and pasting into your project.
    <DemoProvider window={demoWindow}>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout defaultSidebarCollapsed>
          <PageContainer title={title}>
            {/* preview-start */}
            <Crud<Note>
              dataSource={notesDataSource}
              dataSourceCache={notesCache}
              rootPath="/notes"
              initialPageSize={10}
              defaultValues={{ title: 'New note' }}
            />
            {/* preview-end */}
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}
