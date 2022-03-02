import * as React from 'react';
export default function useUrlQueryState(param: string, defaultValue?: string): [string, React.Dispatch<React.SetStateAction<string>>];
