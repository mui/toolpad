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

App will be running under `http://localhost:3000/`

TO DO:

- Add LICENSE (+ in package.json, also update for individual packages)
- docs: How will we do docs? Same as on mui.com? Do we create something new? Do we want to embed them in the app as well?
- set up CI
- studio DOM patches instead of saving the whole DOM as a blob
- Rewrite/Rethink bindings and how they interplay with datasources. Add binding to expressions
- make APIs bindable
- Move API editor under app editor
- Should we move Connection editor under app editor?
- Nested paths pages
- iframe needs to be sandboxed + CSP?
- StudioSandbox => add react-refresh (or decide on alternative, bundler in teh browser?)
- deployments/releases
- secrets encryption and redaction on client

- separate prop types from prop controls
- single "element" type with slots: `'none' | 'single' | 'multiple'` to enable/disable UI for it.

- unbound textfield can't do input
- RPC mechanism, make sure we can check context for authorization
- test drive pomerium

- docker image + compose file for installation
- build persistence in postgres
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

```ts
import { format } = 'https://esm.sh/date-fns'

format(new Date(2014, 1, 11), 'yyyy-MM-dd')
```

```ts
import YouTube from 'https://esm.sh/react-youtube';

return (
  <YouTube
    videoId="2g811Eo7K8U"
    opts={{
      height: '390',
      width: '640',
    }}
  />
);
```
