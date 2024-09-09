import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export default async function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    // TODO: Obtain the current URL to redirect to signIn with `callbackUrl`
    redirect('/auth/signin');
  }
  return (
    <DashboardLayout>
      <PageContainer>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
