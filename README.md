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
- studio DOM patches instead of saving the whole DOM as a blob
- Should we move Connection editor under app editor?
- Nested paths pages
- iframe needs to be sandboxed + CSP?
- StudioSandbox => add react-refresh (or decide on alternative, bundler in teh browser?)
- deployments/releases
- secrets encryption and redaction on client
- test drive pomerium

- docker image + compose file for installation
- build persistence in postgres
- integration tests, (let's consolidate the architecture a bit more first)
- expand @mui/components
- editor:
  - loops StudioNode
  - export code as next.js project
  - data binding => javascript
  - fix data binding to APIs (query StudioNode)
  - make connections UI similar to APIs UI (create connection then edit UI)
- ...
