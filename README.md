# MUI Studio

TO DO:

- Add LICENSE (+ in package.json, also update for individual packages)
- docs: How will we do docs? Same as on mui.com? Do we create something new? Do we want to embed them in the app as well?
- Rename studio-ui lib folder to src?
- set up CI
- ...

## prototypes

### prototype one `PageViewLegacy`:

```
code <- datamodel -> render -> designer
           ^                      |
           |______________________|
```

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
