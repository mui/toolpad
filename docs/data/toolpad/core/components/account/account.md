---
productId: toolpad-core
title: Account
components: Account, AccountDetails
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

The `Account` component is a quick and easy way to display an account management menu for authenticated users. It is deeply integrated with the `SignInPage` and `DashboardLayout` components, meaning that it automatically appears in the top navigation bar inside `DashboardLayout` once your users have signed in through the `SignInPage`.

## States

### Signed In

If a `session` object is present, the component is rendered as a dropdown containing the user's account details as well as an option to sign out.

{{"demo": "AccountDemoSignedIn.js", "bg": "outlined" }}

### Signed Out

When signed out, the component renders as an inline sign in button within the dashboard layout.

{{"demo": "AccountDemoSignedOut.js", "bg": "outlined" }}

## Customization

### Locale Text

Labels for the sign in and sign out buttons can be customized through the `localeText` prop.

{{"demo": "AccountLocale.js", "bg": "outlined" }}

### Slot Props

The underlying `signInButton`, `signOutButton`, `iconButton` and `userDetailsContainer` sections can be customized by passing in `slotProps` to the `Account` component.

{{"demo": "AccountCustom.js", "bg": "outlined" }}

### Slots

You can pass in your own components to completely override the default components inside the `Account` popover through the `slots` prop.

#### Content

Use the `content` slot to customize the entire content of the account popover. If you want to continue using the default account details section along with your custom content, you can use the `AccountDetails` component exported by `@toolpad/core` in your custom component:

##### Account Switcher

{{"demo": "AccountSlotsAccountSwitcher.js", "bg": "outlined"}}

The `content` prop can take any React component, so you can use it to display information instead of adding menu items:

##### Crypto Wallet

{{"demo": "AccountSlotsInfo.js", "bg": "outlined" }}

##### Custom User Details

You can use a `useSession` hook exported by `@toolpad/core` to extend the default session and display any additional user details:

:::info
More details on how to use this hook are available in the [`useSession` docs](/toolpad/core/react-use-session/).
:::

{{"demo": "AccountCustomUserDetails.js", "bg":"outlined"}}
