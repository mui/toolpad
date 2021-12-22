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

### prototype three:

```
code -> render -> designer
 ^                   |
 |___________________|
```
