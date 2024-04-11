---
title: Toolpad Core - Installation
---

# Toolpad Core - Installation

<p class="description">Instructions on setting up Toolpad Core in your project.</p>

## Installation

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

## Install Toolpad Core in an existing project

Toolpad Core is a set of primitives and components designed to be used in existing projects. Simply add the dependency:

<codeblock storageKey="package-manager">

```bash npm
npm install -S @toolpad/core
```

```bash yarn
yarn add @toolpad/core
```

```bash pnpm
pnpm add @toolpad/core
```

</codeblock>
