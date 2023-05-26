# Embed a Toolpad page

<p class="description">Toolpad pages can be embedded anywhere you want to use them</p>

- Set the display mode on your page to **No shell**

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/embed-page/no-shell.png", "alt": "No shell display mode", "caption": "Set display mode to no shell" }}

- Deploy the Toolpad application

  :::info
  See the tutorial on [deploying to Render](/toolpad/tutorials/render-deploy/) on more details
  :::

- Use an `iframe` with `src` set to the URL of the page you wish to embed. For example,
  using

  ```html
  <iframe src="https://tools-public.onrender.com/prod/pages/fn03hvq" loading="lazy">
  </iframe>
  ```

  we can embed a Toolpad page, like so:

    <iframe src="https://tools-public.onrender.com/prod/pages/fn03hvq" loading="lazy"></iframe>
