# Embed a Toolpad page

<p class="description">Toolpad pages can be embedded anywhere you want to use them.</p>

## Using an `iframe`

1. Set the [display mode](/toolpad/concepts/display-mode/) on the page to be embedded to **No shell**

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/embed-page/no-shell.png", "alt": "No shell display mode", "caption": "Set display mode to no shell", "indent": 1 }}

2. Deploy the Toolpad application

   :::info
   See the tutorial on [deploying to Render](/toolpad/how-to-guides/render-deploy/) for more details
   :::

3. Use an `iframe` with `src` set to the URL of the page you wish to embed. For example,
   using

   ```html
   <iframe src="https://tools-public.mui.com/prod/pages/fn03hvq"></iframe>
   ```

   we can embed a Toolpad page, like so:

    <iframe src="https://tools-public.mui.com/prod/pages/fn03hvq" loading="lazy" style="display: block; margin: auto"></iframe>
