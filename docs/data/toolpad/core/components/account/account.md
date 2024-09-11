---
productId: toolpad-core
title: Account
components: Account
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

:::info
If this is your first time using Toolpad Core, you might want to start with the [base concepts](/docs/data/toolpad/core/introduction/base-concepts/) instead.
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

### Components

`Account` can take different labels for the sign in and sign out buttons through the `signInLabel` and `signOutLabel` props. Deeper changes can be made by passing in `slotProps` to the underlying components.

{{"demo": "AccountCustom.js", "bg": "outlined" }}

### 🚧 Composition

The `Account` component allows adding your own menu options, including deeply nested options. This is in progress.
