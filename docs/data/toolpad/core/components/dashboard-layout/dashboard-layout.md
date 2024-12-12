---
productId: toolpad-core
title: Dashboard Layout
components: AppProvider, DashboardLayout, ToolbarActions, ThemeSwitcher, Account
---

# Dashboard Layout

<p class="description">The dashboard layout component provides a customizable out-of-the-box layout for a typical dashboard page.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

The `DashboardLayout` component is a quick, easy way to provide a standard full-screen layout with a header and sidebar to any dashboard page, as well as ready-to-use and easy to customize navigation and branding.

Many features of this component are configurable through the [AppProvider](https://mui.com/toolpad/core/react-app-provider/) component that must wrap it to provide the necessary context.

:::info
For more information on the `AppProvider` component that must wrap this `DashboardLayout`, please check out the [AppProvider](https://mui.com/toolpad/core/react-app-provider/) component documentation.
:::

## Demo

A `DashboardLayout` brings in a header and sidebar with navigation, as well as a scrollable area for page content.

If application [themes](https://mui.com/toolpad/core/react-app-provider/#theming) are defined for both light and dark mode, a theme switcher in the header allows for easy switching between the two modes.

{{"demo": "DashboardLayoutBasic.js", "height": 500, "iframe": true}}

## Branding

Some elements of the `DashboardLayout` can be configured to match your personalized brand.

This can be done via the `branding` prop in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/), which allows for setting a custom `logo` image, a custom `title` text in the page header, and a custom `homeUrl` which the branding component leads to on click.

{{"demo": "DashboardLayoutBranding.js", "height": 400, "iframe": true}}

:::info
Optionally, you can also pass a specific `branding` object as a prop to the `DashboardLayout` component itself.
When applied this way, the properties of this object take precedence over the properties of the `branding` prop passed to the `AppProvider`.

You may also override the default branding by passing in your own component to the `appTitle` slot, as shown in the [Slots section](#slots).
:::

## Navigation

The `navigation` prop in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/) allows for setting any type of navigation structure in the `DashboardLayout` sidebar by including different navigation elements as building blocks in any order.

The flexibility in composing and ordering these different elements allows for a great variety of navigation structures to fit your use case.

:::info
Optionally, you can also pass a specific `navigation` as a prop to the `DashboardLayout` component itself.
When applied this way, this `navigation` takes complete precedence over the `navigation` prop passed to the `AppProvider`.
:::

### Navigation links

Navigation links can be placed in the sidebar as items with the format:

```tsx
{ segment: 'home', title: 'Home', icon: <DescriptionIcon /> }
```

{{"demo": "DashboardLayoutNavigationLinks.js", "height": 400, "iframe": true}}

### Navigation headings

Navigation headings can be placed in the sidebar as items with the format:

```tsx
{ kind: 'header', title: 'Animals' }
```

{{"demo": "DashboardLayoutNavigationHeadings.js", "height": 400, "iframe": true}}

### Navigation dividers

Dividers can can be placed between items in the sidebar as items with the format:

```tsx
{
  kind: 'divider';
}
```

{{"demo": "DashboardLayoutNavigationDividers.js", "height": 400, "iframe": true}}

### Nested navigation

Nested navigation structures can be placed in the sidebar as items with the format:

```tsx
{ title: 'Movies', icon: <FolderIcon />, children: [ ... ] }
```

{{"demo": "DashboardLayoutNavigationNested.js", "height": 400, "iframe": true}}

### Navigation actions

Navigation links have an optional `action` prop to render any content on the right-side of the respective list item, such as badges with numbers, or buttons to toggle a popover menu.

{{"demo": "DashboardLayoutNavigationActions.js", "height": 400, "iframe": true}}

### Navigation pattern matching

Navigation links have an optional `pattern` prop to define a pattern to be matched for the item to be marked as selected.
This feature is built on top of the [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) library.
Some examples:

- Constant path: `orders`
- Dynamic segment: `orders/:segment`
- Optional segment: `orders{/:segment}?`
- One or more segments: `orders{/:segment}+`
- Zero or more segments: `orders{/:segment}*`

{{"demo": "DashboardLayoutPattern.js", "height": 400, "iframe": true}}

### Disable collapsible sidebar

The layout sidebar is collapsible to a mini-drawer (with icons only) in desktop and tablet viewports. This behavior can be disabled with the `disableCollapsibleSidebar` prop.

{{"demo": "DashboardLayoutNoMiniSidebar.js", "height": 400, "iframe": true}}

### Start with mini-drawer on desktop

The layout sidebar can default to a collapsed mini-drawer on desktop viewport sizes with the `defaultSidebarCollapsed` prop.

{{"demo": "DashboardLayoutSidebarCollapsed.js", "height": 400, "iframe": true}}

### Hide navigation

The layout sidebar can be hidden if needed with the `hideNavigation` prop.

{{"demo": "DashboardLayoutSidebarHidden.js", "height": 400, "iframe": true}}

## Full-size content

The layout content can take up the full available area with styles such as `flex: 1` or `height: 100%`.

{{"demo": "DashboardLayoutFullScreen.js", "height": 400, "iframe": true}}

## Account

The `DashboardLayout` comes integrated with the [`<Account />`](/toolpad/core/react-account/) component. It renders as an account management menu when a user is signed in – a `session` object is present – and a button when not.

:::warning
The use of an `iframe` may cause some spacing issues in the following demo.
:::

{{"demo": "DashboardLayoutAccount.js", "height": 400, "iframe": true}}

## Customization

### Slots

Certain areas of the layout can be replaced with custom components by using the `slots` and `slotProps` props.
Some possibly useful slots:

- `appTitle`: allows you to customize the app title section in the layout header.

- `toolbarActions`: allows you to add new items to the toolbar in the header, such as a search bar or button. The default `ThemeSwitcher` component can be imported and used if you wish to do so, as shown in the example below.

- `sidebarFooter`: allows you to add footer content in the sidebar.

{{"demo": "DashboardLayoutSlots.js", "height": 400, "iframe": true}}

### Examples

#### User account in layout sidebar

{{"demo": "DashboardLayoutAccountSidebar.js", "height": 400, "iframe": true}}

#### Settings menu with custom theme switcher

The `useColorScheme` hook can be used to create a custom theme switcher.

{{"demo": "DashboardLayoutCustomThemeSwitcher.js", "height": 400, "iframe": true}}
