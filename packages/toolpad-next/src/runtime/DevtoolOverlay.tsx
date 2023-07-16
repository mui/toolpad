import * as React from 'react';
import { Box, IconButton, Theme, ThemeProvider, Typography, createTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ToolpadFile } from '../shared/schemas';
import DataGridFileEditor from './DataGridFileEditor';

const THEME: Theme = createTheme({
  components: {
    MuiList: {
      defaultProps: {
        dense: true,
      },
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiListItemButton: {
      defaultProps: {
        dense: true,
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiIcon: {
      defaultProps: {
        fontSize: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'small',
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 0,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 8,
          minHeight: 0,
        },
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
    MuiFilledInput: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputBase: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

interface FileEditorProps {
  value: ToolpadFile;
  onChange: (value: ToolpadFile) => void;
}

function FileEditor({ value, onChange }: FileEditorProps) {
  switch (value.kind) {
    case 'DataGrid':
      return <DataGridFileEditor value={value} onChange={onChange} />;
    default:
      return <Typography>Unknown file: {value.kind}</Typography>;
  }
}

export interface DevtoolOverlayProps {
  name: string;
  file: ToolpadFile;
  onClose?: () => void;
}

export default function DevtoolOverlay({ name, file, onClose }: DevtoolOverlayProps) {
  const height = '50vh';

  const [inputValue, setInputValue] = React.useState(file);

  React.useEffect(() => {
    const originalMarginBottom = document.body.style.marginBottom;
    document.body.style.marginBottom = height;
    return () => {
      document.body.style.marginBottom = originalMarginBottom;
    };
  }, [height]);

  return (
    <ThemeProvider theme={THEME}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height,
          background: 'white',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            pl: 2,
          }}
        >
          <Typography>
            {name} ({file.kind})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography>Status:</Typography>
            <Box
              sx={{
                display: 'inline-block',
                borderRadius: '50%',
                width: 16,
                height: 16,
                backgroundColor: 'success.main',
              }}
            />
            <Typography>Connected</Typography>

            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <FileEditor value={inputValue} onChange={setInputValue} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
