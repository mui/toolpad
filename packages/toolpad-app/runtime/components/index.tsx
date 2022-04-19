/*
This module re-exports everything from the @mui/toolpad-components. We will use it in the importmap.
This way it reloads changes without requiring us to rerun ./scripts/esInstall.ts
*/
export * from '@mui/toolpad-components';
export { default } from '@mui/toolpad-components';
