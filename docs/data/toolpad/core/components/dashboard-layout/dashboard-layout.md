# Dashboard Layout

<p class="description">The dashboard layout component provides a customizable out-of-the-box layout for a typical dashboard page.</p>

## Demo

A DashboardLayout has a configurable header and sidebar with navigation.

{{"demo": "DashboardLayoutBasic.js", "height": 500, "iframe": true}}

Some features of this layout depend on the `AppProvider` component that must be present at the base application level.

## Branding

The `branding` prop in the `AppProvider` allows for setting a `logo` or `title` in the page header.

{{"demo": "DashboardLayoutBranding.js", "height": 500, "iframe": true}}

## Navigation

The `navigation` prop in the `AppProvider` allows for setting any type of navigation structure in the sidebar, such as links, headings, nested collapsible lists and dividers, in any order.

{{"demo": "DashboardLayoutNavigation.js", "height": 640, "iframe": true}}

<!-- ## API

See the documentation below for a complete reference to all of the props available to the components mentioned here.

- [`<AppProvider />`](/toolpad/core/reference/components/app-provider/#properties)
- [`<DashboardLayout />`](/toolpad/core/reference/components/dashboard-layout/#properties) -->
