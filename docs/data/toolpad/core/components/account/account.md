---
productId: toolpad-core
title: Account
components: Account, AccountPreview, AccountPopoverHeader, AccountPopoverFooter, SignInButton, SignOutButton
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

The `Account` component is a quick and easy way to display an account management menu for authenticated users. It is deeply integrated with the `SignInPage` and `DashboardLayout` components, meaning that it automatically appears in the top navigation bar inside `DashboardLayout` once your users have signed in through the `SignInPage`.

## States

### Signed in

If a `session` object is present, the component is rendered as a dropdown containing the user's account details as well as an option to sign out.

{{"demo": "AccountDemoSignedIn.js", "bg": "outlined" }}

### Signed out

When signed out, the component renders as an inline sign in button within the dashboard layout.

{{"demo": "AccountDemoSignedOut.js", "bg": "outlined", "defaultCodeOpen": false }}

## Customization

The `<Account />` component is composed of multiple subcomponents:

- `<SignInButton />`
- `<AccountPreview />`
- `<Popover />`
- `<SignOutButton />`

You can pass extra props to them through the `slotProps` prop on the `<Account />` component. You may also completely override them by passing your own custom components to `<Account />` through the `slots` prop.

The labels can be customized through the `localeText` prop.

### Slot Props

The `AccountPreview` component has two variants, `condensed` (the default) and `expanded`. You can change the variant used inside `<Account />` by passing in custom props through `slotProps`:

{{"demo": "AccountCustomSlotProps.js", "bg": "outlined" }}

### Slots

You can pass in your own components inside the `Account` popover through the `slots` prop.

#### Popover Content

You can wrap the default subcomponents – such as `SignOutButton` and `AccountPreview` – and wrap them in `AccountPopoverHeader` and `AccountPopoverFooter` components to create custom account popovers, as shown in the following demos:

##### Account Switcher

You can build advanced menus – such as a tenant switcher – by passing in a component that wraps `AccountPreview` and `SignOutButton` with a custom menu:

{{"demo": "AccountSlotsAccountSwitcher.js", "bg": "outlined"}}

### Labels

You can pass in custom labels – including of different languages – using the `localeText` prop.

{{"demo": "AccountCustomLocaleText.js", "bg": "outlined" }}

### Session

You can use the `useSession` hook to extend the existing session and add additional user details:

{{"demo": "./AccountCustomUserDetails.js", "bg": "outlined", "defaultCodeOpen": false}}

You can find more details on the [`useSession` docs page](/toolpad/core/react-use-session/).
