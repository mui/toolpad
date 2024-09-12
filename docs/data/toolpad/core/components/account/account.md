---
productId: toolpad-core
title: Account
components: Account
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

:::info
If this is your first time using Toolpad Core, you might want to start with the [base concepts](/toolpad/core/introduction/base-concepts/) instead.
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

### Slot Props

The underlying `signInButton`, `signOutButton` and `iconButton` components can be customized by passing in `slotProps` to the `Account` component.

Labels for the sign in and sign out buttons can be customized through the `localeText` prop.

{{"demo": "AccountCustom.js", "bg": "outlined" }}

### Slots

You can pass in your own items to the `Account` menu through the `menuItems` slot to add additional menu items in the space between the user's account details and the sign out button, to create larger, more complex menus:

{{"demo": "AccountSlots.js", "bg": "gradient"}}
