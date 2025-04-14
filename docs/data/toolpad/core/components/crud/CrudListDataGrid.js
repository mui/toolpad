import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { DataSourceCache, List } from '@toolpad/core/Crud';
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
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

let peopleStore = [
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
    { field: 'firstName', headerName: 'First name' },
    { field: 'lastName', headerName: 'Last name' },
    { field: 'age', headerName: 'Age', type: 'number' },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let processedPeople = [...peopleStore];

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
              return personValue > value;
            case '<':
              return personValue < value;
            default:
              return true;
          }
        });
      });
    }

    if (sortModel?.length) {
      processedPeople.sort((a, b) => {
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

    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedPeople = processedPeople.slice(start, end);

    return { items: paginatedPeople, itemCount: processedPeople.length };
  },
  deleteOne: async (personId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    peopleStore = peopleStore.filter((person) => person.id !== Number(personId));
  },
};

const peopleCache = new DataSourceCache();

function CrudListDataGrid(props) {
  const { window } = props;
  const router = useDemoRouter('/people');
  const demoWindow = window !== undefined ? window() : undefined;

  const handleRowClick = React.useCallback((personId) => {
    console.log(`Row click with id ${personId}`);
  }, []);

  const handleCreateClick = React.useCallback(() => {
    console.log('Create click');
  }, []);

  const handleEditClick = React.useCallback((personId) => {
    console.log(`Edit click with id ${personId}`);
  }, []);

  const handleDelete = React.useCallback((personId) => {
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
        <PageContainer>
          {/* preview-start */}
          <List
            dataSource={peopleDataSource}
            dataSourceCache={peopleCache}
            initialPageSize={4}
            onRowClick={handleRowClick}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
            slots={{ dataGrid: DataGridPro }}
            slotProps={{
              dataGrid: { checkboxSelection: true },
            }}
          />
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

CrudListDataGrid.propTypes = {
  window: PropTypes.func,
};

export default CrudListDataGrid;
