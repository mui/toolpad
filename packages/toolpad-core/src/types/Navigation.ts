interface Route {
  label: string;
  path?: string;
  icon: React.ReactNode;
  routes?: (Omit<Route, 'routes'> & { path: string })[];
}

interface NavigationSection {
  title: string;
  routes: Route[];
}

export type Navigation = NavigationSection[];
