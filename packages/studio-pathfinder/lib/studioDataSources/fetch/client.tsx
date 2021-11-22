import * as React from 'react';
import { StudioDataSourceClient } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { FetchQuery } from './types';

function ConnectionParamsInput() {
  return null;
}

function QueryEditor({ value, onChange }: WithControlledProp<FetchQuery>) {
  return <div>TO DO</div>;
}

function getInitialQueryValue(): FetchQuery {
  return { url: '', method: '', headers: [] };
}

// TODO simplify object for default connections
const dataSource: StudioDataSourceClient<{}, FetchQuery> = {
  displayName: 'Fetch',
  needsConnection: false,
  ConnectionParamsInput,
  isConnectionValid: () => true,
  getInitialConnectionValue: () => ({}),
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
