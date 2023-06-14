import { createFunction } from '@mui/toolpad/server';
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://hacker-news.firebaseio.com/',
});

export const getStories = createFunction(
  async ({ parameters }) => {
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
  },
  {
    helperText: 'Encodes text into a QR code.',
    parameters: {
      content: {
        helperText: 'The content to encode.',
        type: 'string',
      },
    },
  },
);
