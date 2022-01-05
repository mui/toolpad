# MUI Studio

## Instructions

Run this first to build/watch:

```
yarn dev
```

Then start MUI Studio in CWD:

```sh
yarn cli
```

or start MUI Studio in a different folder:

```sh
yarn cli ./my-app
```

TO DO:

- Add LICENSE (+ in package.json, also update for individual packages)
- docs: How will we do docs? Same as on mui.com? Do we create something new? Do we want to embed them in the app as well?
- set up CI
- Read live studio node property values from sandbox
- studio DOM patches instead of saving the whole DOM as a blob
- iframe needs to be sandboxed + CSP
- StudioSandbox => add react-refresh (or decide on alternative, bundler in teh browser?)
- decide on persistence, json files vs. sqlite vs. postgres?
- integration tests, (let's consolidate the architecture a bit more first)
- expand @mui/components
- editor:
  - loops StudioNode
  - custom components
  - export code as next.js project
  - import components (let's start with ESM?)
  - data binding => javascript
  - fix data binding to APIs (query StudioNode)
  - make connections UI similar to APIs UI (create connection then edit UI)
- ...

## prototypes

### prototype one `PageViewLegacy`:

```
code <- datamodel -> render -> designer
           ^                      |
           |______________________|
```

Removed by now, we will always render code

### prototype two: `PageView`:

```
datamodel -> code -> render -> designer
   ^                              |
   |______________________________|
```
