---
productId: toolpad-core
title: Account
components: Account
---

# Account

<p class="description">A component that renders an account management dropdown for your application.</p>

The `Account` component is a quick and easy way to display an account management menu for authenticated users. It is deeply integrated with the `SignInPage` and `DashboardLayout` components, meaning that it automatically appears in the top navigation bar inside `DashboardLayout` once your users have signed in through the `SignInPage`.

## States

If a `session` object is present, the component is rendered as a dropdown containing the user's account details as well as an option to sign out. When signed out, the component renders as an inline sign in button within the dashboard layout.

{{"demo": "AccountDemo.js", "bg": "outlined" }}

## Customization

### Slot Props

`Account` can take different labels for the sign in and sign out buttons through the `signInLabel` and `signOutLabel` props. Deeper changes can be made by passing in `slotProps` to the underlying components.

{{"demo": "AccountCustom.js", "bg": "outlined" }}

### Slots

You can pass in your own items to the `Account` menu through the `menuItems` slot to create larger, more complex menus:

{{"demo": "AccountSlots.js", "bg": "gradient"}}
