import { NextApiRequest, NextApiResponse } from 'next';
import { getEmployeesStore, setEmployeesStore } from '../../../employeesStore';
import type { Employee } from '../../../data/employees';
import type { OmitId } from '@toolpad/core/Crud';

export async function getEmployee(req: NextApiRequest, res: NextApiResponse) {
  const { id: employeeId } = req.query;

  const employeesStore = getEmployeesStore();

  const employeeToShow = employeesStore.find((employee) => employee.id === Number(employeeId));

  if (!employeeToShow) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return res.status(200).json(employeeToShow);
}

export async function updateEmployee(req: NextApiRequest, res: NextApiResponse) {
  const body: Partial<OmitId<Employee>> = req.body;
  const { id: employeeId } = req.query;

  const employeesStore = getEmployeesStore();

  let updatedEmployee: Employee | null = null;

  setEmployeesStore(
    employeesStore.map((employee) => {
      if (employee.id === Number(employeeId)) {
        updatedEmployee = { ...employee, ...body };
        return updatedEmployee;
      }
      return employee;
    }),
  );

  if (!updatedEmployee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return res.status(200).json(updatedEmployee);
}

export async function deleteEmployee(req: NextApiRequest, res: NextApiResponse) {
  const { id: employeeId } = req.query;

  const employeesStore = getEmployeesStore();

  setEmployeesStore(employeesStore.filter((employee) => employee.id !== Number(employeeId)));

  return res.status(200).json({ success: true });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getEmployee(req, res);
  }

  if (req.method === 'PUT') {
    return updateEmployee(req, res);
  }

  if (req.method === 'DELETE') {
    return deleteEmployee(req, res);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
