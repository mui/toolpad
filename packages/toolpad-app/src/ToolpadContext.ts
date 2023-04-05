import * as React from 'react';

export const ToolpadContext = React.createContext<{ envVarNames: string[] }>({ envVarNames: [] });
