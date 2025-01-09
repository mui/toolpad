# Toolpad Core - Vite with React Router and Firebase Auth

This template provides a minimal setup to get React working in Vite with HMR, and authentication with Firebase.

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

## Clone using `create-toolpad-app`

To copy this example and customize it for your needs, run

```bash
npx create-toolpad-app@latest --example firebase-vite
# or
pnpm dlx create-toolpad-app@latest --example firebase-vite
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
