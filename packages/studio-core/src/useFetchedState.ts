import { GridRowsProp } from '@mui/x-data-grid-pro';
import { QueryFunction, useQuery } from 'react-query';

type ObjectPath = string[];

function parseObjectPath(path: string): ObjectPath {
  return path.split('.').filter(Boolean);
}

function parseObjectPaths(paths: Record<string, string>): Record<string, ObjectPath> {
  return Object.fromEntries(
    Object.entries(paths).map(([key, path]) => {
      return [key, parseObjectPath(path)];
    }),
  );
}

function getObjectPath(object: unknown, path: ObjectPath): unknown | null {
  if (path.length <= 0) {
    return object;
  }
  const [first, ...rest] = path;
  if (typeof object === 'object' && object && Object.prototype.hasOwnProperty.call(object, first)) {
    return getObjectPath((object as any)[first], rest);
  }
  return null;
}

function fromCollection(object: unknown): any[] {
  if (Array.isArray(object)) {
    return object;
  }

  if (typeof object === 'object' && object) {
    return Object.entries(object);
  }

  return [];
}

function select(object: unknown, objectPaths: Record<string, ObjectPath>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objectPaths).map(([key, path]) => {
      return [key, getObjectPath(object, path as ObjectPath)];
    }),
  );
}

interface FetchFetchedStateParams {
  url: string;
  collectionPath?: string;
  fieldPaths?: Record<string, string>;
}

interface FetchedState {
  raw: any;
  columns: { field: string }[];
  rows: GridRowsProp;
}

const fetchFetchedState: QueryFunction<FetchedState, [FetchFetchedStateParams]> = async ({
  queryKey,
}) => {
  const [{ url, collectionPath = '', fieldPaths = {} }] = queryKey;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  const raw = await res.json();

  const collection = fromCollection(getObjectPath(raw, parseObjectPath(collectionPath)));

  const rows: GridRowsProp = collection.map((row, i) => {
    const paths = parseObjectPaths(fieldPaths);
    const resultRow = select(row, paths);
    return {
      id: i,
      ...resultRow,
    };
  });

  const columns = Object.keys(fieldPaths).map((field) => ({ field }));

  return {
    columns,
    raw,
    rows,
  };
};

export interface UseFetchedState {
  loading: boolean;
  columns: { field: string }[];
  raw: any;
  rows: GridRowsProp;
  error: any;
}

export default function useFetchedState(input: FetchFetchedStateParams): UseFetchedState {
  const { isLoading: loading, error, data } = useQuery([input], fetchFetchedState);

  const { columns = [], rows = [], raw } = data || {};

  return {
    loading,
    columns,
    raw,
    rows,
    error,
  };
}
