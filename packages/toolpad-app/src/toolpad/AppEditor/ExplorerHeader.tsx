import * as React from 'react';
import {
  IconButton,
  Tooltip,
  Stack,
  Typography,
  styled,
  InputAdornment,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface ExplorerHeaderProps {
  headerText: string;
  createLabelText?: string;
  onCreate?: React.MouseEventHandler<HTMLButtonElement>;
  searchLabelText?: string;
  onSearch?: (searchTerm: string) => void | Promise<void>;
  hasPersistentSearch?: boolean;
}

const ExplorerHeaderContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1,
  height: 40,
}));

const ExplorerHeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  flexGrow: 1,
  fontWeight: theme.typography.fontWeightLight,
}));

export default function ExplorerHeader({
  headerText,
  onCreate,
  onSearch,
  createLabelText,
  searchLabelText = 'Search',
  hasPersistentSearch = false,
}: ExplorerHeaderProps) {
  const [isSearching, setIsSearching] = React.useState(false || hasPersistentSearch);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearchClick = React.useCallback(() => {
    if (isSearching && searchTerm) {
      setSearchTerm('');
    }

    setIsSearching((previousIsSearching) => !previousIsSearching);
  }, [isSearching, searchTerm]);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearchTerm('');
  }, []);

  React.useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [onSearch, searchTerm]);

  return (
    <ExplorerHeaderContainer
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ pl: isSearching ? 2 : 2.5 }}
    >
      {isSearching ? (
        <TextField
          hiddenLabel
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              fontSize: 14,
              borderRadius: 0,
            },
          }}
          variant="filled"
          fullWidth
          size="small"
          placeholder={`${searchLabelText}…`}
        />
      ) : (
        <ExplorerHeaderTitle
          variant="body2"
          sx={{
            mx: 0.5,
            my: 0.5,
          }}
        >
          {headerText}
        </ExplorerHeaderTitle>
      )}
      {onSearch && searchLabelText && !hasPersistentSearch ? (
        <Tooltip title={searchLabelText}>
          <IconButton aria-label={searchLabelText} size="medium" onClick={handleSearchClick}>
            <SearchIcon color={isSearching ? 'primary' : 'inherit'} />
          </IconButton>
        </Tooltip>
      ) : null}
      {onCreate && createLabelText ? (
        <Tooltip title={createLabelText}>
          <IconButton aria-label={createLabelText} size="medium" onClick={onCreate}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </ExplorerHeaderContainer>
  );
}
