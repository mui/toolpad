'use client';
import { DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { z } from 'zod';

type EmployeeRole = 'Market' | 'Finance' | 'Development';

export interface Employee extends DataModel {
  id: number;
  name: string;
  age: number;
  joinDate: string;
  role: EmployeeRole;
}

const API_URL = '/api/employees';

export const employeesDataSource: DataSource<Employee> = {
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
    const queryParams = new URLSearchParams();

    queryParams.append('page', paginationModel.page.toString());
    queryParams.append('pageSize', paginationModel.pageSize.toString());
    if (sortModel?.length) {
      queryParams.append('sort', JSON.stringify(sortModel));
    }
    if (filterModel?.items?.length) {
      queryParams.append('filter', JSON.stringify(filterModel.items));
    }

    const res = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.error);
    }
    return resJson;
  },
  getOne: async (employeeId) => {
    const res = await fetch(`${API_URL}/${employeeId}`);
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.error);
    }
    return resJson;
  },
  createOne: async (data) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.error);
    }
    return resJson;
  },
  updateOne: async (employeeId, data) => {
    const res = await fetch(`${API_URL}/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.error);
    }
    return resJson;
  },
  deleteOne: async (employeeId) => {
    const res = await fetch(`${API_URL}/${employeeId}`, { method: 'DELETE' });
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.error);
    }
    return resJson;
  },
  validate: z.object({
    name: z.string({ required_error: 'Name is required' }).nonempty('Name is required'),
    age: z.number({ required_error: 'Age is required' }).min(18, 'Age must be at least 18'),
    joinDate: z
      .string({ required_error: 'Join date is required' })
      .nonempty('Join date is required'),
    role: z.enum(['Market', 'Finance', 'Development'], {
      errorMap: () => ({ message: 'Role must be "Market", "Finance" or "Development"' }),
    }),
  })['~standard'].validate,
};

export const employeesCache = new DataSourceCache();
