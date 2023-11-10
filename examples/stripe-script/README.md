# Stripe Script

<p class="description">A Toolpad application that demonstrates running complex scripts.</p>

## Demo

https://github.com/mui/mui-toolpad/assets/19550456/bd327963-c061-4a75-906d-22acdd696211

## How to use

Download the example [or clone the repo](https://github.com/mui/mui-toolpad):

<!-- #default-branch-switch -->

```bash
curl https://codeload.github.com/mui/mui-toolpad/tar.gz/master | tar -xz --strip=2  mui-toolpad-master/examples/stripe-script
cd stripe-script
```

Install it and run:

```bash
npm install
npm run dev
```

The app depends on a `STRIPE_TOKEN` to fetch invoice data

## What's inside

The app involves the following workflow:

1. List pending invoices from Stripe in a data grid component

2. Connect a script that downloads all invoices as a `.zip` file to Toolpad through a custom function

3. Generate the downloaded file link on a Button click

## The source

[Check out the source code](https://github.com/mui/mui-toolpad/tree/master/examples/stripe-script)
