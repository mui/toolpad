---
title: Toolpad Core - Installation
---

# Toolpad Core - Installation

<p class="description">Learn how to install Toolpad Core in your local environment.</p>

## Install instructions

Run

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

Follow the instructions of the CLI. After you conclude the installation process, change your working dir to the project and run
<codeblock storageKey="package-manager">

```bash npm
npm run dev
```

```bash pnpm
pnpm run dev
```

```bash yarn
yarn dev
```

</codeblock>

Visit **http://localhost:3000/** in your browser to open the application

## Options of the CLI

- Do you want to enable authentication?
  - select authentication method
  - follow instructions at XYZ and paste the auth token (written to .env)
- Do you want to enable RBAC
- …?

The CLI scaffolds a Next.js project with all Toolpad features set up
