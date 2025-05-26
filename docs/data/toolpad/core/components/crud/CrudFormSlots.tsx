import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION: Navigation = [
  {
    segment: 'things',
    title: 'Things',
    icon: <LocalActivityIcon />,
    pattern: 'things{/:thingId}*',
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

export interface Thing extends DataModel {
  id: number;
  text: string;
  boolean: boolean;
  date: Date;
  option: string;
}

let thingsStore: Thing[] = [
  {
    id: 1,
    text: 'I am the first thing.',
    boolean: true,
    date: new Date('2024-06-01'),
    option: 'option1',
  },
  {
    id: 2,
    text: 'I am the second thing.',
    boolean: false,
    date: new Date('2024-06-02'),
    option: 'option2',
  },
];

export const thingsDataSource: DataSource<Thing> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'text', headerName: 'Text', flex: 1 },
    { field: 'boolean', headerName: 'Boolean', type: 'boolean', flex: 1 },
    {
      field: 'date',
      headerName: 'Date',
      type: 'date',
      valueGetter: (value) => value && new Date(value),
    },
    {
      field: 'option',
      headerName: 'Option',
      type: 'singleSelect',
      valueOptions: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
      flex: 1,
    },
  ],

  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let processedThings = [...thingsStore];

    // Apply filters (demo only)
    if (filterModel?.items?.length) {
      filterModel.items.forEach(({ field, value, operator }) => {
        if (!field || value == null) {
          return;
        }

        processedThings = processedThings.filter((thing) => {
          const thingValue = thing[field];

          switch (operator) {
            case 'contains':
              return String(thingValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case 'equals':
              return thingValue === value;
            case 'startsWith':
              return String(thingValue)
                .toLowerCase()
                .startsWith(String(value).toLowerCase());
            case 'endsWith':
              return String(thingValue)
                .toLowerCase()
                .endsWith(String(value).toLowerCase());
            case '>':
              return (thingValue as number) > value;
            case '<':
              return (thingValue as number) < value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortModel?.length) {
      processedThings.sort((a, b) => {
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
    const paginatedThings = processedThings.slice(start, end);

    return {
      items: paginatedThings,
      itemCount: processedThings.length,
    };
  },

  getOne: async (thingId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const thingToShow = thingsStore.find((thing) => thing.id === Number(thingId));

    if (!thingToShow) {
      throw new Error('Thing not found');
    }
    return thingToShow;
  },

  createOne: async (data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const newThing = {
      id: thingsStore.reduce((max, thing) => Math.max(max, thing.id), 0) + 1,
      ...data,
    } as Thing;

    thingsStore = [...thingsStore, newThing];

    return newThing;
  },

  updateOne: async (thingId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let updatedThing: Thing | null = null;

    thingsStore = thingsStore.map((thing) => {
      if (thing.id === Number(thingId)) {
        updatedThing = { ...thing, ...data };
        return updatedThing;
      }
      return thing;
    });

    if (!updatedThing) {
      throw new Error('Thing not found');
    }
    return updatedThing;
  },

  deleteOne: async (thingId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    thingsStore = thingsStore.filter((thing) => thing.id !== Number(thingId));
  },
};

const thingsCache = new DataSourceCache();

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

export default function CrudFormSlots(props: DemoProps) {
  const { window } = props;

  const router = useDemoRouter('/things/new');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === '/things/new') {
      return 'New Thing';
    }
    const editThingId = matchPath('/things/:thingId/edit', router.pathname);
    if (editThingId) {
      return `Thing ${editThingId} - Edit`;
    }
    const showThingId = matchPath('/things/:thingId', router.pathname);
    if (showThingId) {
      return `Thing ${showThingId}`;
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
            <Crud<Thing>
              dataSource={thingsDataSource}
              dataSourceCache={thingsCache}
              rootPath="/things"
              initialPageSize={10}
              defaultValues={{ title: 'New thing' }}
              slotProps={{
                form: {
                  textField: {
                    variant: 'filled',
                  },
                  checkbox: {
                    color: 'secondary',
                  },
                  datePicker: {
                    views: ['year', 'month'],
                  },
                  select: {
                    variant: 'standard',
                  },
                },
              }}
            />
            {/* preview-end */}
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}
