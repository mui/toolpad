import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

function DashboardPage() {
  return (
    <PageContainer>
      <Typography>Welcome to Toolpad!</Typography>
    </PageContainer>
  );
}

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
});
