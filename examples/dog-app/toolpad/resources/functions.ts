import { createFunction } from '@mui/toolpad/server';

export const getDogs = createFunction(async function getDogs() {
  // fetch from https://dog.ceo/api/breeds/image/random
  const dogs = await fetch('https://dog.ceo/api/breeds/image/random');
  return [await dogs.json()];
});
