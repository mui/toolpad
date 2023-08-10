import { request } from 'graphql-request';

export async function queryStargazers(owner: string, repository: string) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(`Env variable GITHUB_TOKEN not configured`);
  }

  const endpoint = 'https://api.github.com/graphql';
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

  const response = request(
    endpoint,
    query,
    {
      repository: repository,
      owner: owner,
    },
    {
      Authorization: `Bearer ${token}`,
    },
  );

  return response;
}
