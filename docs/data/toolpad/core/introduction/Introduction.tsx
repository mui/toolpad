import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION: Navigation = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'people',
    title: 'People',
    icon: <PersonIcon />,
    pattern: 'people{/:personId}*',
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

export interface Person extends DataModel {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

let peopleStore: Person[] = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 6, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 7, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const peopleDataSource: DataSource<Person> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    {
      field: 'firstName',
      headerName: 'First name',
    },
    {
      field: 'lastName',
      headerName: 'Last name',
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
    },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let processedPeople = [...peopleStore];

    // Apply filters (demo only)
    if (filterModel?.items?.length) {
      filterModel.items.forEach(({ field, value, operator }) => {
        if (!field || value == null) {
          return;
        }

        processedPeople = processedPeople.filter((person) => {
          const personValue = person[field];

          switch (operator) {
            case 'contains':
              return String(personValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case 'equals':
              return personValue === value;
            case 'startsWith':
              return String(personValue)
                .toLowerCase()
                .startsWith(String(value).toLowerCase());
            case 'endsWith':
              return String(personValue)
                .toLowerCase()
                .endsWith(String(value).toLowerCase());
            case '>':
              return (personValue as number) > value;
            case '<':
              return (personValue as number) < value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortModel?.length) {
      processedPeople.sort((a, b) => {
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
    const paginatedPeople = processedPeople.slice(start, end);

    return {
      items: paginatedPeople,
      itemCount: processedPeople.length,
    };
  },
  getOne: async (personId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const personToShow = peopleStore.find(
      (person) => person.id === Number(personId),
    );

    if (!personToShow) {
      throw new Error('Person not found');
    }
    return personToShow;
  },
  createOne: async (data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const newPerson = {
      id: peopleStore.reduce((max, person) => Math.max(max, person.id), 0) + 1,
      ...data,
    } as Person;

    peopleStore = [...peopleStore, newPerson];

    return newPerson;
  },
  updateOne: async (personId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let updatedPerson: Person | null = null;

    peopleStore = peopleStore.map((person) => {
      if (person.id === Number(personId)) {
        updatedPerson = { ...person, ...data };
        return updatedPerson;
      }
      return person;
    });

    if (!updatedPerson) {
      throw new Error('Person not found');
    }
    return updatedPerson;
  },
  deleteOne: async (personId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    peopleStore = peopleStore.filter((person) => person.id !== Number(personId));
  },
  validate: (formValues) => {
    let issues: { message: string; path: [keyof Person] }[] = [];

    if (!formValues.firstName) {
      issues = [
        ...issues,
        { message: 'First name is required', path: ['firstName'] },
      ];
    }
    if (!formValues.lastName) {
      issues = [...issues, { message: 'Last name is required', path: ['lastName'] }];
    }
    if (!formValues.age) {
      issues = [...issues, { message: 'Age is required', path: ['age'] }];
    } else if (formValues.age <= 0) {
      issues = [
        ...issues,
        { message: 'Must be at least 1 year old', path: ['age'] },
      ];
    }

    return { issues };
  },
};

const peopleCache = new DataSourceCache();

function matchPath(pattern: string, pathname: string): string | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function DemoPageContent({ pathname }: { pathname: string }) {
  const personId = matchPath('/people/:personId', pathname);

  if (pathname.includes('/people')) {
    return (
      <Crud<Person>
        dataSource={peopleDataSource}
        dataSourceCache={peopleCache}
        rootPath="/people"
        initialPageSize={4}
        defaultValues={{ age: 18 }}
        pageTitles={{
          create: 'New Person',
          edit: `Person ${personId} - Edit`,
          show: `Person ${personId}`,
        }}
      />
    );
  }

  return (
    <PageContainer>
      <Box
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography>Dashboard content for {pathname}</Typography>
      </Box>
    </PageContainer>
  );
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function Introduction(props: DemoProps) {
  const { window } = props;

  const router = useDemoRouter('/home');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // Remove this provider when copying and pasting into your project.
    <DemoProvider window={demoWindow}>
      {/* preview-start */}
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout defaultSidebarCollapsed>
          <DemoPageContent pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
      {/* preview-end */}
    </DemoProvider>
  );
}
