# Stripe Script

<p class="description">A Toolpad Studio application that demonstrates running complex scripts.</p>

## Demo

https://github.com/mui/mui-toolpad/assets/19550456/bd327963-c061-4a75-906d-22acdd696211

## How to run

Use `create-toolpad-app` to bootstrap the example:

```bash
npx create-toolpad-app@latest --example custom-server
```

```bash
yarn create toolpad-app --example custom-server
```

```bash
pnpm create toolpad-app --example custom-server
```

## Prerequisite

The app depends on a `STRIPE_TOKEN` to fetch invoice data

## What's inside

The app involves the following workflow:

1. List pending invoices from Stripe in a data grid component

2. Use a script that downloads all invoices as a `.zip` file in Toolpad Studio through a custom function

3. Run the script on Button click to generate and display a download link

## The source

[Check out the source code](https://github.com/mui/mui-toolpad/tree/master/examples/stripe-script)
