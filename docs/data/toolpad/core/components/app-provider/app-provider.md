---
productId: toolpad-core
title: App Provider
components: AppProvider
---

# App Provider

<p class="description">The app provider component provides the necessary context for a Toolpad application, such as routing, navigation and theming.</p>

## Basic

Wrap the whole application with the `AppProvider` component to enable many of Toolpad's features.

{{"demo": "AppProviderBasic.js", "height": 500, "iframe": true}}

## Next.js

The `AppProvider` for Next.js applications includes routing out-of-the-box.

```tsx
import { AppProvider } from '@toolpad/core/nextjs/AppProvider';
// or
import { AppProvider } from '@toolpad/core/nextjs';
```
