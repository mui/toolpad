import { GridComponentsPropsOverrides } from '@mui/x-data-grid/models/props/GridProps';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      defaultProps?: Partial<GridComponentsPropsOverrides>;
      styleOverrides?: Record<string, any>;
    };
    MuiPickersInputBase?: {
      styleOverrides?: Record<string, any>;
    };
  }
}
