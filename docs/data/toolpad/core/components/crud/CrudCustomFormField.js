import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Crud, DataSourceCache } from '@toolpad/core/Crud';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';

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
  {
    id: 1,
    title: 'Grocery List Item',
    text: 'Buy more coffee.',
    tags: ['urgent', 'todo'],
  },
  {
    id: 2,
    title: 'Personal Goal',
    text: 'Finish reading the book.',
    tags: ['todo'],
  },
];

function TagsFormField({ value, onChange, error }) {
  const labelId = 'tags-label';
  const label = 'Tags';

  const handleChange = (event) => {
    const updatedTags = event.target.value;
    onChange(typeof updatedTags === 'string' ? [updatedTags] : updatedTags);
  };

  return (
    <FormControl error={!!error} fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        multiple
        value={value ?? []}
        onChange={handleChange}
        labelId={labelId}
        name="tags"
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((selectedValue) => (
              <Chip key={selectedValue} label={selectedValue} />
            ))}
          </Box>
        )}
        fullWidth
      >
        <MenuItem value="urgent">Urgent</MenuItem>
        <MenuItem value="todo">Todo</MenuItem>
      </Select>
      <FormHelperText>{error ?? ' '}</FormHelperText>
    </FormControl>
  );
}

// preview-start

TagsFormField.propTypes = {
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.oneOf(['todo', 'urgent']).isRequired)
    .isRequired,
};

export const notesDataSource = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'text', headerName: 'Text', flex: 1 },
    {
      field: 'tags',
      headerName: 'Tags',
      valueFormatter: (value) => {
        return value && value.join(', ');
      },
      renderFormField: ({ value, onChange, error }) => (
        <TagsFormField value={value} onChange={onChange} error={error} />
      ),
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
      ...data,
    };

    notesStore = [...notesStore, newNote];

    return newNote;
  },
  updateOne: async (noteId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let updatedNote = null;

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
    let issues = [];

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

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function CrudCustomFormField(props) {
  const { window } = props;

  const router = useDemoRouter('/notes');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const noteId = matchPath('/notes/:noteId', router.pathname);

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
          <Crud
            dataSource={notesDataSource}
            dataSourceCache={notesCache}
            rootPath="/notes"
            initialPageSize={10}
            defaultValues={{ title: 'New note' }}
            pageTitles={{
              create: 'New Note',
              edit: `Note ${noteId} - Edit`,
              show: `Note ${noteId}`,
            }}
          />
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

CrudCustomFormField.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CrudCustomFormField;
