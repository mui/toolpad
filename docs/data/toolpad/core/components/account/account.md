---
productId: toolpad-core
title: Account
components: Account
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

The `Account` component is a quick and easy way to display an account management menu for authenticated users. It works deeply with the `SignInPage` and `DashboardLayout` components, meaning that it automatically appears to the top navigation bar inside `DashboardLayout` once your users have signed in through the `SignInPage`.

## States

When signed out, the component renders as an inline sign in button within the dashboard layout. If a `session` object is present, the component is rendered as a dropdown containing the user's account details as well as an option to sign out.

{{"demo": "AccountDemo.js", "bg": "gradient" }}

## Customization

### Components

`Account` can take different labels for the sign in and sign out buttons through the `signInLabel` and `signOutLabel` props. Deeper changes can be made by passing in `slotProps` to the underlying components.

{{"demo": "AccountCustom.js", "bg": "gradient" }}

### 🚧 Composition

The `Account` component allows adding your own menu options, including deeply nested options. This is in progress.
