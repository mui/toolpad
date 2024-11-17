<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://mui.com/toolpad/" rel="noopener" target="_blank"><img width="150" src="https://mui.com/static/branding/product-toolpad-light.svg" alt="Toolpad logo"></a>
</p>

<h1 align="center">Toolpad</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mui/material-ui/blob/HEAD/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/@toolpad/core/latest.svg)](https://www.npmjs.com/package/@toolpad/core)
[![npm downloads](https://img.shields.io/npm/dm/@toolpad/core.svg)](https://www.npmjs.com/package/@toolpad/core)
[![GitHub branch status](https://img.shields.io/github/checks-status/mui/toolpad/HEAD)](https://github.com/mui/toolpad/commits/HEAD/)
[![Follow on X](https://img.shields.io/twitter/follow/Toolpad_.svg?label=follow+Toolpad)](https://x.com/Toolpad_)
[![Renovate status](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://github.com/mui/toolpad/issues/8)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/mui/toolpad.svg)](https://isitmaintained.com/project/mui/toolpad 'Average time to resolve an issue')
[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/mui-org)](https://opencollective.com/mui-org)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/6294/badge)](https://www.bestpractices.dev/projects/6294)

</div>

## Product walkthrough

- [Toolpad Core](https://mui.com/toolpad/core/introduction/) is a set of high level React components that abstract common concepts such as layout navigation and routing. It aims at helping you build and maintain dashboards and internal tooling faster. It's built on top of [Material UI](http://github.com/mui/material-ui/).

https://github.com/user-attachments/assets/d2a7ff8e-2dd6-4313-98d2-5f136513f9a9/

- [Toolpad Studio](https://mui.com/toolpad/studio/getting-started/) is a self-hosted low-code admin builder designed to extend the Toolpad Core React components. It's for developers of all trades who want to save time building internal applications. Drag and drop from a catalog of pre-built components, connect to any data source and build apps quickly.

https://github.com/user-attachments/assets/f47466df-3790-4a05-8f38-f1aaa13a49f3/

## Notice

Toolpad is in its beta stages of development. Feel free to run this application to try it out for your use cases, and share any feedback, bug reports or feature requests that you come across.

## Quick setup locally

Toolpad Core:

```bash
npx create-toolpad-app@latest
# or
pnpm create toolpad-app
# or
yarn create toolpad-app
```

Toolpad Studio:

```bash
npx create-toolpad-app@latest --studio my-toolpad-studio-app
# or
yarn create toolpad-app --studio my-toolpad-studio-app
# or
pnpm create toolpad-app --studio my-toolpad-studio-app
```

## Documentation

Check out our [documentation](https://mui.com/toolpad/studio/getting-started/).

## Examples

### Core

Find a [list of example apps](https://mui.com/toolpad/core/introduction/examples/) on the docs to help you get started with Toolpad Core quickly.

### Studio

Check out our [mui-public](https://tools-public.mui.com/prod/pages/OverviewPage) app to see how a Toolpad Studio app looks in production.
Our documentation contains more [examples](https://mui.com/toolpad/studio/examples/) to help you get started.

## Contributing

Read the [contributing guide](/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to MUI.

Notice that contributions go far beyond pull requests and commits.
Although we love giving you the opportunity to put your stamp on MUI, we also are thrilled to receive a variety of [other contributions](https://mui.com/getting-started/faq/#mui-is-awesome-how-can-i-support-the-project).

## Changelog

The [changelog](https://github.com/mui/toolpad/releases) is regularly updated to reflect what's changed in each new release.

## Roadmap

Future plans and high-priority features and enhancements can be found in the [roadmap](https://mui.com/toolpad/studio/getting-started/roadmap/).

## License

This project is licensed under the terms of the [MIT license](/LICENSE).

## Sponsoring services

These great services sponsor MUI's core infrastructure:

[<img loading="lazy" alt="GitHub" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png" height="25">](https://github.com/)

GitHub allows us to host the Git repository and coordinate contributions.

[<img loading="lazy" alt="Netlify" src="https://cdn.netlify.com/15ecf59b59c9d04b88097c6b5d2c7e8a7d1302d0/1b6d6/img/press/logos/full-logo-light.svg" height="30">](https://www.netlify.com/)

Netlify allows us to distribute the documentation.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mui.com/static/readme/browserstack-darkmode.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://mui.com/static/readme/browserstack-lightmode.svg">
  <img alt="BrowserStack logo" src="https://mui.com/static/readme/browserstack-lightmode.svg" width="140" height="25">
</picture>

BrowserStack allows us to test in real browsers.

[<img loading="lazy" alt="CodeCov" src="https://github.com/codecov.png?size=70" width="35" height="35">](https://codecov.io/)

CodeCov allows us to monitor the test coverage.
