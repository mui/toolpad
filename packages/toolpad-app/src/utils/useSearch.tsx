import * as React from 'react';
import { TextField } from '@mui/material';
import Search from '@mui/icons-material/SearchOutlined';

/**
 * Creates a search field.
 * @param elements The elements to search through.
 * @param  {string=} placeholder The value of the placeholder text
 * @returns The search field and the filtered elements
 */

function useSearch<T>(elements: T[], placeholder?: string): [JSX.Element, T[]] {
  const [searchText, setSearchText] = React.useState('');

  const handleSearchInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const filteredElements = React.useMemo(() => {
    return elements.filter((elem: any) =>
      elem.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [elements, searchText]);

  return [
    <TextField
      sx={{ py: 0 }}
      key={'search'}
      InputProps={{
        startAdornment: <Search />,
      }}
      placeholder={placeholder ?? 'Search'}
      value={searchText}
      onChange={handleSearchInput}
    />,
    filteredElements,
  ];
}

export default useSearch;
