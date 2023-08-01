import axios from 'axios';

const client = axios.create({
  baseURL: 'https://hacker-news.firebaseio.com/',
});

export async function getStories() {
  const { data: topStoryIds } = await client.get('/v0/topstories.json', {
    params: {
      orderBy: '"$key"',
      limitToFirst: 20,
    },
  });

  const stories = await Promise.all(
    topStoryIds.map(async (id: string) => {
      const { data } = await client.get(`/v0/item/${id}.json`);
      return data;
    }),
  );

  return stories;
}
