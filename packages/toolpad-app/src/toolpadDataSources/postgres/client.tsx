import * as React from 'react';
import { ClientDataSource, ConnectionEditorProps } from '../../types';
import { SqlConnectionParams, SqlQuery } from '../sql/types';
import { QueryEditor, ConnectionParamsInput, getInitialQueryValue } from '../sql/client';

function PostgreSQLConnectionParamsInput({
  value,
  onChange,
}: ConnectionEditorProps<SqlConnectionParams>) {
  return <ConnectionParamsInput value={value} onChange={onChange} defaultPort={5432} />;
}

const dataSource: ClientDataSource<SqlConnectionParams, SqlQuery> = {
  displayName: 'PostgreSQL',
  ConnectionParamsInput: PostgreSQLConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
