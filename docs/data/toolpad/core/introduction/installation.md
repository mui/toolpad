---
title: Toolpad Core - Installation
---

# Toolpad Core - Installation

<p class="description">Learn how to install Toolpad Core in your local environment.</p>

## Install instructions

1. Run the following command to start Toolpad Core:

<codeblock storageKey="package-manager">

```bash npm
npx create-toolpad-app@latest --core
```

```bash pnpm
pnpm create toolpad-app --core
```

```bash yarn
yarn create toolpad-app --core
```

</codeblock>

2. Follow the instructions presented. Once the installation ends, run:

<codeblock storageKey="package-manager">

```bash npm
cd <project-name>
npm run dev
```

```bash pnpm
cd <project-name>
pnpm run dev
```

```bash yarn
cd <project-name>
yarn dev
```

</codeblock>

3. Visit **http://localhost:3000/** in your browser to open the application

4. `create-toolpad-app` will generate starter code for a Next.js app. The features included in the bootstrapped app will depend on the preference provided to the CLI:

- Using the app/pages router
- Using authentication
- Using a data provider
