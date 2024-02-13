# GitHub Authentication

<p class="description">An app that shows how to set up GitHub authentication in Toolpad.</p>

Example showcasing how to set up GitHub authentication in a Toolpad app. [The docs](https://mui.com/toolpad/concepts/authentication/).

<a target="_blank">
  <img src="https://mui.com/static/toolpad/marketing/auth-github.png" alt="GitHub Authentication" style="aspect-ratio: 131/88;" width="524">
</a>

## How to run

To use this example, you need to set the environment variables shown in [.env.example](.env.example).
To get those values, please:

- Follow [this section](https://mui.com/toolpad/concepts/authentication/#authentication-secret) on how to create an authentication secret.
- Set up your own GitHub OAuth app by following [these instructions](https://mui.com/toolpad/concepts/authentication/#github).

Then, use `create-toolpad-app` to bootstrap the example:

```bash
npx create-toolpad-app@latest --example auth-github
```

```bash
yarn create toolpad-app --example auth-github
```

```bash
pnpm create toolpad-app --example auth-github
```

or:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/mui/mui-toolpad/tree/master/examples/auth-github)
