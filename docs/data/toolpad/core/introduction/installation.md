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

2. You will be asked to choose amongst your preferred frameworks (Next.js/Vite), routers and authentication providers. Once the installation ends, run:

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

4. A sample directory structure with the Next.js App router will look like this:

   **Without Authentication:**

   ```bash
   ├── app
   │   ├── (dashboard)
   │   │   ├── layout.tsx
   │   │   ├── page.tsx
   │   │   └── orders
   │   │       └── page.tsx
   │   └── layout.tsx
   ├── .env
   ├── .env.local
   ├── .eslintrc.json
   ├── .gitignore
   ├── next.config.js
   ├── package.json
   ├── README.md
   └── tsconfig.json
   ```

   **With Authentication:**

   ```bash
   ├── app
   │   ├── auth
   │   │   └── signin
   │   │       └── page.tsx
   │   ├── api
   │   │   └── auth
   │   │       └── [...nextauth]
   │   │           └── route.ts
   │   ├── (dashboard)
   │   │   ├── layout.tsx
   │   │   ├── page.tsx
   │   │   └── orders
   │   │       └── page.tsx
   │   └── layout.tsx
   ├── .env
   ├── .env.local
   ├── .eslintrc.json
   ├── .gitignore
   ├── next.config.js
   ├── package.json
   ├── README.md
   └── tsconfig.json
   ```

5. Installation is complete! Begin building your project by making edits to `(dashboard)/page.tsx`. To understand how to leverage Toolpad Core to build dashboards quickly, [see the detailed tutorial](/toolpad/core/introduction/tutorial/).

6. If you selected authentication, you will need to provide values to the `.env` files that have been created. See more information on the [usage with authentication libraries section](https://mui.com/toolpad/core/react-sign-in-page/#usage-with-authentication-libraries).
