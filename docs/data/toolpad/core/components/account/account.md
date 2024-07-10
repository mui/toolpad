---
productId: toolpad-core
title: Account
components: Account
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

The `Account` component is a quick and easy way to display an account management menu for authenticated users. It works deeply with the `SignInPage` and `DashboardLayout` components, meaning that it automatically appears to the top navigation bar inside `DashboardLayout` once your users have signed in through the `SignInPage`.

## Unauthenticated

When signed out, the component renders as an inline sign in button within the dashboard layout

{{"demo": "AccountSignedOut.js", "iframe": "true", "height": 500}}

## Authenticated

Once signed in, the component is rendered as a dropdown containing the user's account details as well as an option to sign out.

{{"demo": "AccountSignedIn.js", "iframe": "true", "height": 500}}

## 🚧 Customization

The `Account` component will allow adding your own menu options, including deeply nested options, through `slots`. This is in progress.
