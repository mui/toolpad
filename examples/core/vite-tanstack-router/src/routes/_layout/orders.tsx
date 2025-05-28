import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@mui/material/Typography';

export default function OrdersPage() {
  return <Typography>Welcome to the Toolpad orders!</Typography>;
}

export const Route = createFileRoute('/_layout/orders')({
  component: OrdersPage,
});
