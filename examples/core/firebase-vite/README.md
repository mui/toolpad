# Toolpad Core - Vite with React Router and Firebase Auth

This example provides a minimal setup to get Toolpad Core working in Vite with HMR, as well as routing with React Router and authentication with Firebase.

## Clone using `create-toolpad-app`

To copy this example and customize it for your needs, run

```bash
npx create-toolpad-app@latest --example firebase-vite
# or
pnpm create toolpad-app --example firebase-vite
```

## Setting up

The project requires a `.env` with the following variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGE_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## The source

[Check out the source code](https://github.com/mui/toolpad/tree/master/examples/core/vite/)
