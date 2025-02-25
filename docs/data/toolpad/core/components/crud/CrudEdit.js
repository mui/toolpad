import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { DataSourceCache, Edit } from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
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

let people = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 6, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 7, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const peopleDataSource = {
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
    return new Promise((resolve, reject) => {
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
  updateOne: (personId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedPerson = null;

        people = people.map((person) => {
          if (person.id === Number(personId)) {
            updatedPerson = { ...person, ...data };
            return updatedPerson;
          }
          return person;
        });

        if (updatedPerson) {
          resolve(updatedPerson);
        } else {
          reject(new Error('Note not found'));
        }
      }, 750);
    });
  },
  validate: (formValues) => {
    const errors = {};

    if (!formValues.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!formValues.lastName) {
      errors.lastName = 'Last name is required';
    }
    if (!formValues.age) {
      errors.age = 'Age is required';
    } else if (formValues.age <= 0) {
      errors.age = 'Must be at least 1 year old';
    }

    return errors;
  },
};

const peopleCache = new DataSourceCache();

function CrudEdit(props) {
  const { window } = props;

  const router = useDemoRouter('/people/1/edit');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const handleSubmitSuccess = React.useCallback(() => {
    console.log('Person edited successfully');
  }, []);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title="Edit Person">
          {/* preview-start */}
          <Edit
            id={1}
            dataSource={peopleDataSource}
            dataSourceCache={peopleCache}
            onSubmitSuccess={handleSubmitSuccess}
          />
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

CrudEdit.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CrudEdit;
