---
title: Toolpad Core - Installation
---

# Installation

<p class="description">Learn how to install Toolpad Core in your local environment.</p>

## Manual installation

Use your preferred package manager to install `@toolpad/core` in your project:

<codeblock storageKey="package-manager">

```bash npm
npm install @toolpad/core
```

```bash pnpm
pnpm add @toolpad/core
```

```bash yarn
yarn add @toolpad/core
```

</codeblock>

The Toolpad Core package has a peer dependency on `@mui/material` and `@mui/icons-material`. If you aren't using these already in your project, you can install them with:

<codeblock storageKey="package-manager">

```bash npm
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

```bash pnpm
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
```

```bash yarn
yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled
```

</codeblock>

## Automatic installation

1. Run the following command to start Toolpad Core:

<codeblock storageKey="package-manager">

```bash npm
npx create-toolpad-app@latest
```

```bash pnpm
pnpm create toolpad-app
```

```bash yarn
yarn create toolpad-app
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

3. Visit **http://localhost:3000/** in your browser to open the application.

4. The CLI bootstraps the following directory:

   ```bash
    ├── app
    │ ├── auth
    │ ├──── [...path]
    │ └────── page.tsx
    │ ├── api
    │ ├──── auth
    │ ├────── [...nextAuth]
    │ └───────── route.tsx
    │ ├── (dashboard)
    | ├──── layout.tsx
    │ ├──── page
    │ └────── page.tsx
    ├──── layout.tsx
    └──── page.tsx

   ```

   and the following page appears when you run the project locally:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/bootstrap.png", "srcDark": "/static/toolpad/docs/core/bootstrap-dark.png","alt": "Toolpad Core entry point", "caption": "Starting with Toolpad Core", "zoom": true, "indent": 1 }}

5. Installation is complete! Begin building your project by making edits to `(dashboard)/page/page.tsx`. To understand how to leverage Toolpad Core to build dashboards quickly, [see the detailed tutorial](/toolpad/core/introduction/tutorial/).
