import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@mui/material/Typography';

function DashboardPage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
});
