import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/layout';

export default function Layout(props: { children: React.ReactNode }) {
  return <DashboardLayout>{props.children}</DashboardLayout>;
}
