export interface NavigationRoute {
  label: string;
  path?: string;
  icon: React.ReactNode;
  routes?: (Omit<NavigationRoute, 'routes'> & { path: string })[];
}

export interface NavigationSection {
  title: string;
  routes: NavigationRoute[];
}

export type Navigation = NavigationSection[];
