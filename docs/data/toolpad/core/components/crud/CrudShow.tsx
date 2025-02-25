import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { DataModel, DataSource, DataSourceCache, Show } from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION: Navigation = [
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

let people: Person[] = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 6, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 7, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const peopleDataSource: DataSource<Person> &
  Required<Pick<DataSource<Person>, 'getOne'>> = {
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
  getOne: (personId) => {
    return new Promise<Person>((resolve, reject) => {
      setTimeout(() => {
        const personToShow = people.find((person) => person.id === Number(personId));

        if (personToShow) {
          resolve(personToShow);
        } else {
          reject(new Error('Person not found'));
        }
      }, 750);
    });
  },
  deleteOne: (personId) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        people = people.filter((person) => person.id !== Number(personId));

        resolve();
      }, 750);
    });
  },
};

const peopleCache = new DataSourceCache();

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function CrudShow(props: DemoProps) {
  const { window } = props;

  const router = useDemoRouter('/people/1');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const handleEditClick = React.useCallback((personId: string | number) => {
    console.log(`Edit click with id ${personId}`);
  }, []);

  const handleDelete = React.useCallback((personId: string | number) => {
    console.log(`Person with id ${personId} deleted`);
  }, []);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title="Person">
          {/* preview-start */}
          <Show<Person>
            id={1}
            dataSource={peopleDataSource}
            dataSourceCache={peopleCache}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
          />
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
