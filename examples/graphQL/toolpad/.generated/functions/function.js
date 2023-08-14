var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// toolpad/resources/function.ts
var function_exports = {};
__export(function_exports, {
  queryStargazers: () => queryStargazers
});
module.exports = __toCommonJS(function_exports);
var import_graphql_request = require("graphql-request");
async function queryStargazers(owner, repository) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(`Env variable GITHUB_TOKEN not configured`);
  }
  const endpoint = "https://api.github.com/graphql";
  const token = process.env.GITHUB_TOKEN;
  const query = `
query stargazersList($repository: String!, $owner: String! ) {
  repository(name: $repository, owner: $owner) {
    stargazerCount
    stargazers(first: 100, after: null orderBy: {field: STARRED_AT, direction: DESC}) {
      nodes {
        company
        email
        location
        name
        updatedAt
        createdAt
        login
        bio
        followers {
          totalCount
        }
      }
    }
  }
}`;
  const response = (0, import_graphql_request.request)(
    endpoint,
    query,
    {
      repository,
      owner
    },
    {
      Authorization: `Bearer ${token}`
    }
  );
  return response;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  queryStargazers
});
