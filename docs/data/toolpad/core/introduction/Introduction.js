import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataSourceCache } from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'employees',
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
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

let employeesStore = [
  {
    id: 1,
    name: 'Edward Perry',
    age: 25,
    joinDate: new Date().toISOString(),
    role: 'Finance',
  },
  {
    id: 2,
    name: 'Josephine Drake',
    age: 36,
    joinDate: new Date().toISOString(),
    role: 'Market',
  },
  {
    id: 3,
    name: 'Cody Phillips',
    age: 19,
    joinDate: new Date().toISOString(),
    role: 'Development',
  },
];

export const employeesDataSource = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'age', headerName: 'Age', type: 'number' },
    {
      field: 'joinDate',
      headerName: 'Join date',
      type: 'date',
      valueGetter: (value) => value && new Date(value),
      width: 140,
    },
    {
      field: 'role',
      headerName: 'Department',
      type: 'singleSelect',
      valueOptions: ['Market', 'Finance', 'Development'],
      width: 160,
    },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let filteredEmployees = [...employeesStore];

    // Apply filters (example only)
    if (filterModel?.items?.length) {
      filterModel.items.forEach(({ field, value, operator }) => {
        if (!field || value == null) {
          return;
        }

        filteredEmployees = filteredEmployees.filter((employee) => {
          const employeeValue = employee[field];

          switch (operator) {
            case 'contains':
              return String(employeeValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case 'equals':
              return employeeValue === value;
            case 'startsWith':
              return String(employeeValue)
                .toLowerCase()
                .startsWith(String(value).toLowerCase());
            case 'endsWith':
              return String(employeeValue)
                .toLowerCase()
                .endsWith(String(value).toLowerCase());
            case '>':
              return employeeValue > value;
            case '<':
              return employeeValue < value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortModel?.length) {
      filteredEmployees.sort((a, b) => {
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
    const paginatedEmployees = filteredEmployees.slice(start, end);

    return {
      items: paginatedEmployees,
      itemCount: filteredEmployees.length,
    };
  },
  getOne: async (employeeId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const employeeToShow = employeesStore.find(
      (employee) => employee.id === Number(employeeId),
    );

    if (!employeeToShow) {
      throw new Error('Employee not found');
    }
    return employeeToShow;
  },
  createOne: async (data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const newEmployee = {
      id:
        employeesStore.reduce((max, employee) => Math.max(max, employee.id), 0) + 1,
      ...data,
    };

    employeesStore = [...employeesStore, newEmployee];

    return newEmployee;
  },
  updateOne: async (employeeId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    let updatedEmployee = null;

    employeesStore = employeesStore.map((employee) => {
      if (employee.id === Number(employeeId)) {
        updatedEmployee = { ...employee, ...data };
        return updatedEmployee;
      }
      return employee;
    });

    if (!updatedEmployee) {
      throw new Error('Employee not found');
    }
    return updatedEmployee;
  },
  deleteOne: async (employeeId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    employeesStore = employeesStore.filter(
      (employee) => employee.id !== Number(employeeId),
    );
  },
  validate: (formValues) => {
    const issues = [];

    if (!formValues.name) {
      issues.push({ message: 'Name is required', path: ['name'] });
    }

    if (!formValues.age) {
      issues.push({ message: 'Age is required', path: ['age'] });
    } else if (formValues.age < 18) {
      issues.push({ message: 'Age must be at least 18', path: ['age'] });
    }

    if (!formValues.joinDate) {
      issues.push({ message: 'Join date is required', path: ['joinDate'] });
    }

    const validRoles = ['Market', 'Finance', 'Development'];
    if (!formValues.role || !validRoles.includes(formValues.role)) {
      issues.push({
        message: 'Role must be "Market", "Finance" or "Development"',
        path: ['role'],
      });
    }

    return { issues };
  },
};

export const employeesCache = new DataSourceCache();

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function DemoPageContent({ pathname }) {
  if (pathname.includes('/employees')) {
    return (
      <Crud
        dataSource={employeesDataSource}
        dataSourceCache={employeesCache}
        rootPath="/employees"
        initialPageSize={10}
      />
    );
  }

  return (
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
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function Introduction(props) {
  const { window } = props;

  const router = useDemoRouter('/home');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === '/employees/new') {
      return 'New Employee';
    }
    const editEmployeeId = matchPath('/employees/:employeeId/edit', router.pathname);
    if (editEmployeeId) {
      return `Employee ${editEmployeeId} - Edit`;
    }
    const showEmployeeId = matchPath('/employees/:employeeId', router.pathname);
    if (showEmployeeId) {
      return `Employee ${showEmployeeId}`;
    }

    return undefined;
  }, [router.pathname]);

  return (
    // preview-start
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title={title}>
          <DemoPageContent pathname={router.pathname} />
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

Introduction.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default Introduction;
