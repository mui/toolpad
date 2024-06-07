/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor, fireEvent, within, screen } from '@testing-library/react';
import { DataGrid as XDataGrid } from '@mui/x-data-grid';
import describeConformance from '@toolpad/utils/describeConformance';
import invariant from 'invariant';
import Box from '@mui/material/Box';
import { DataGrid } from './DataGrid';
import { createDataProvider } from '../DataProvider';

function createSequence() {
  let nextId = 1;
  return () => {
    const id = nextId;
    nextId += 1;
    return id;
  };
}

function getRow(root: HTMLElement, rowIndex: number): HTMLElement {
  const row = root.querySelector<HTMLElement>(`[role="row"][data-rowindex="${rowIndex}"]`);
  if (row == null) {
    throw new Error(`Row ${rowIndex} not found`);
  }
  return row;
}

function getCell(root: HTMLElement, rowIndex: number, colIndex: number): HTMLElement {
  const cell = root.querySelector<HTMLElement>(
    `[role="row"][data-rowindex="${rowIndex}"] [role="gridcell"][data-colindex="${colIndex}"]`,
  );
  if (cell == null) {
    throw new Error(`Cell ${rowIndex} ${colIndex} not found`);
  }
  return cell;
}

describe('DataGrid', () => {
  afterEach(cleanup);

  describeConformance(<DataGrid />, () => ({
    inheritComponent: XDataGrid,
    skip: ['themeDefaultProps'],
  }));

  test('renders content correctly', async () => {
    const getNextId = createSequence();
    const rows = [
      { id: getNextId(), name: 'Alice' },
      { id: getNextId(), name: 'Bob' },
    ];
    const dataProvider = createDataProvider({
      getMany: async () => ({ rows }),
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    });

    render(<DataGrid height={300} dataProvider={dataProvider} />);

    await screen.findByText('Alice');

    expect(screen.queryByRole('button', { name: 'Add record' })).toBeFalsy();
  });

  test(
    'Supports create flow',
    async () => {
      const getNextId = createSequence();
      let rows = [
        { id: getNextId(), name: 'Alice' },
        { id: getNextId(), name: 'Bob' },
      ];
      const dataProvider = createDataProvider({
        getMany: async () => ({ rows }),
        createOne: vi.fn(async (data) => {
          const newRow = { ...data, id: getNextId() };
          rows = [...rows, newRow];
          return newRow;
        }),
        fields: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      });

      const view = render(
        <Box sx={{ width: 700 }}>
          <DataGrid height={300} dataProvider={dataProvider} />
        </Box>,
      );

      await screen.findByText('Alice');

      expect(screen.queryAllByRole('menuitem', { name: 'Edit' })).toHaveLength(0);
      expect(screen.queryAllByRole('menuitem', { name: 'Delete' })).toHaveLength(0);

      const addRecordButton = screen.getByRole('button', { name: 'Add record' });

      fireEvent.click(addRecordButton);

      const nameInput = getCell(view.baseElement, 0, 1).querySelector('input');
      expect(nameInput).toBeTruthy();

      const saveButton = screen.getByRole('menuitem', { name: 'Save' });

      fireEvent.change(nameInput!, { target: { value: 'Charlie' } });

      fireEvent.click(saveButton);

      await waitFor(() => expect(getCell(view.baseElement, 2, 1).textContent).toBe('Charlie'));
      const snackbar = await screen.findByRole('alert');
      expect(snackbar.textContent).toMatch('Row created');

      within(snackbar).getByRole('button', { name: 'Show' }).click();
      await waitFor(() =>
        expect(within(screen.getByRole('rowgroup')).queryAllByRole('row')).toHaveLength(1),
      );
      expect(screen.getByText('Charlie')).toBeTruthy();

      expect(dataProvider.createOne).toHaveBeenCalledOnce();
      expect(dataProvider.createOne).toHaveBeenCalledWith({ name: 'Charlie' });
    },
    {
      timeout: 10000000,
    },
  );

  test('Supports update flow', async () => {
    const getNextId = createSequence();
    let rows = [
      { id: getNextId(), name: 'Alice' },
      { id: getNextId(), name: 'Bob' },
    ];
    const dataProvider = createDataProvider({
      getMany: async () => ({ rows }),
      updateOne: vi.fn(async (id, data) => {
        const existingRow = rows.find((row) => row.id === id);
        invariant(existingRow, `Row with id ${id} not found`);
        const updatedRow = { ...existingRow, ...data };
        rows = rows.map((row) => (row.id === updatedRow.id ? updatedRow : row));
        return updatedRow;
      }),
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    });

    const view = render(<DataGrid height={300} dataProvider={dataProvider} />);

    await screen.findByText('Alice');

    expect(
      screen
        .queryAllByRole('menuitem', { name: 'Edit' })
        .filter((el) => !(el as HTMLButtonElement).disabled),
    ).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Add record' })).toBeFalsy();

    const editRecordButton = within(getRow(view.baseElement, 1)).getByRole('menuitem', {
      name: 'Edit',
    });

    fireEvent.click(editRecordButton);

    const saveButton = await screen.findByRole('menuitem', { name: 'Save' });

    expect(
      screen
        .queryAllByRole('menuitem', { name: 'Edit' })
        .filter((el) => !(el as HTMLButtonElement).disabled),
    ).toHaveLength(0);

    const nameInput = getCell(view.baseElement, 1, 1).querySelector('input');
    expect(nameInput).toBeTruthy();
    expect(nameInput!.value).toBe('Bob');
    fireEvent.change(nameInput!, { target: { value: 'Charlie' } });

    fireEvent.click(saveButton);

    await waitFor(() => expect(getCell(view.baseElement, 1, 1).textContent).toBe('Charlie'));

    await waitFor(() => {
      expect(
        screen
          .queryAllByRole('menuitem', { name: 'Edit' })
          .filter((el) => !(el as HTMLButtonElement).disabled),
      ).toHaveLength(2);
    });

    expect(dataProvider.updateOne).toHaveBeenCalledOnce();

    const snackbar = await screen.findByRole('alert');
    expect(snackbar.textContent).toMatch('Row updated');

    within(snackbar).getByRole('button', { name: 'Show' }).click();
    await waitFor(() =>
      expect(within(screen.getByRole('rowgroup')).queryAllByRole('row')).toHaveLength(1),
    );
    expect(screen.getByText('Charlie')).toBeTruthy();
  });

  test('Supports delete flow', async () => {
    const getNextId = createSequence();
    let rows = [
      { id: getNextId(), name: 'Alice' },
      { id: getNextId(), name: 'Bob' },
    ];
    const dataProvider = createDataProvider({
      getMany: async () => ({ rows }),
      deleteOne: vi.fn(async (id) => {
        rows = rows.filter((row) => row.id !== id);
      }),
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    });

    const view = render(<DataGrid height={300} dataProvider={dataProvider} />);

    await screen.findByText('Alice');

    expect(screen.queryAllByRole('menuitem', { name: 'Edit' })).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Add record' })).toBeFalsy();

    const deleteRecordButton = within(getRow(view.baseElement, 1)).getByRole('menuitem', {
      name: 'Delete "2"',
    });

    await screen.findByText('Bob');

    fireEvent.click(deleteRecordButton);

    await waitFor(() => expect(screen.queryByText('Bob')).toBeFalsy());

    const snackbar = await screen.findByRole('alert');
    expect(snackbar.textContent).toMatch('Row deleted');
  });
});
