# Notes

Codemirror + typescript resources:

- https://discuss.codemirror.net/t/codemirror-6-and-typescript-lsp/3398/3
- https://github.com/FurqanSoftware/codemirror-languageserver
- http://www.blog.wylie.su/codemirror-lsp

tentative dir 13 to do list:

- remove all non-dir13 things, make the local mode a default
- add a .gitignore file to the `.toolpad-generated` folder
- lots of issues around custom component editing. e.g. files with capital first letter.
- improve DX for developing on toolpad locally: open vscode button, default files,...
- port tests over
- consensus on a file system layout
- consensus on routing
- consensus on API (`createComponent`, `createQuery`,...)
- create a npm publishing flow
- Support custom components with node modules
- build step (catch problems in ci instead of runtime)
- handle runtime process exiting
- trim package size
- automatically pick port if 3000 is in use?
- automatically open editor in the browser on start?
- directly bind to data from a table/select/chart without creating a query?
- reference @types/node in user project
- `toolpad init` command?
- avoid having to install `@mui/toolpad-core`. Can we have users import e.g. `createComponent` from `@mui/toolpad`?
- more concise way of defining argTypes, or helper methods to build them up
- infer query `parameters` typescript type from the definiton
- Better error handling for query:
  ```ts
  export async function repro() {
    const x: any = {};
    x.x = x;
    return x;
  }
  ```
  or just let it error?
- which node versions to support?
- remove function datasource
- remove all datasources?
- deploys take too long, optimize
