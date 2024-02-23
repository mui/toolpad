import * as fs from 'fs/promises';

export async function getData() {
  const content = await fs.readFile('./data.json', 'utf-8');
  const data = JSON.parse(content);
  return data;
}
