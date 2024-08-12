---
title: Tutorial
---

# Toolpad Core - Tutorial

<p class="description">Learn how to use Toolpad Core through an illustrative example dashboard.</p>

## Bootstrapping

<br/>

1. To choose a project name and create a basic project for this tutorial, run:

<codeblock storageKey="package-manager">

```bash npm
npx create-toolpad-app@latest --example core-tutorial
```

```bash pnpm
pnpm create toolpad-app --example core-tutorial
```

```bash yarn
yarn create toolpad-app --example core-tutorial
```

  </codeblock>

2. To start the basic project on [http://localhost:3000](http://localhost:3000/), run:

<codeblock storageKey="package-manager">

```bash npm
cd <project-name>
npm install && npm run dev
```

```bash pnpm
cd <project-name>
pnpm install && pnpm dev
```

```bash yarn
cd <project-name>
yarn && yarn dev
```

</codeblock>

3. The following splash screen appears:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/installation-1.png", "alt": "Toolpad Core entry point", "caption": "Starting with Toolpad Core", "zoom": true, "indent": 1 }}

4. The app has one page already created, which can be viewed by clicking on the "Go to page" button. The following page should appear:

{{"demo": "TutorialDefault.js", "iframe": true, "hideToolbar": true }}

## Create a new page

<br/>

1. To add a new page and make it appear in the sidebar navigation, create a new folder within the `(dashboard)` directory titled `page-2` and add the following content to `page.tsx` inside it:

```tsx title="./(dashboard)/page-2/page.tsx"
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Typography variant="h6" color="grey.800">
      This is page 2!
    </Typography>
  );
}
```

2. Add the newly created page to the sidebar navigation by adding the following code to the navigation items array in `app/layout.tsx`:

```tsx title="app/layout.tsx"
// Add the following import:
import TimelineIcon from '@mui/icons-material/TimelineIcon';

// ...

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'page',
    title: 'Page',
    icon: <DashboardIcon />,
  },
  // Add the following new item:
  {
    segment: 'page-2',
    title: 'Page 2',
    icon: <TimelineIcon />,
  },
];
```

The newly created page can now be navigated to from the sidebar, like the following:

{{"demo": "TutorialPages.js", "iframe": true, "hideToolbar": true }}
