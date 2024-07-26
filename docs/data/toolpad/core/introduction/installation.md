---
title: Toolpad Core - Installation
---

# Installation

## Automatic Installation

<p class="description">Learn how to install Toolpad Core in your local environment.</p>

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

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/installation-1.png", "alt": "Toolpad Core entry point", "caption": "Starting with Toolpad Core", "zoom": true, "indent": 1 }}

5. Installation is complete! Begin building your project by making edits to `(dashboard/page/page.tsx`. To understand how to leverage Toolpad Core to build dashboards quickly, [see the detailed tutorial](/toolpad/core/introduction/tutorial/).

## Manual Installation

Start by installing the required dependencies:

<codeblock storageKey="package-manager">

```bash npm
npm install -S @toolpad/core next@latest react@latest react-dom@latest
```

```bash yarn
yarn add @toolpad/core next@latest react@latest react-dom@latest
```

```bash pnpm
pnpm add @toolpad/core next@latest react@latest react-dom@latest
```

</codeblock>

Then you'll have to add the Toolpad Core scripts to your `package.json`:

```json
// ./package.json
...
  "scripts": {
    "toolpad-studio:dev": "next dev ./my-toolpad-core-app",
    "toolpad-studio:build": "next build ./my-toolpad-core-app",
    "toolpad-studio:start": "next start ./my-toolpad-core-app"
  }
...
```

Now you can start your Toolpad Core application using one of the commands:

<codeblock storageKey="package-manager">

```bash npm
npm run toolpad-core:dev
```

```bash yarn
yarn toolpad-core:dev
```

```bash pnpm
pnpm toolpad-core:dev
```

</codeblock>

When you run this command, Toolpad Core will initialize the application in the **./my-toolpad-core-app** folder.
