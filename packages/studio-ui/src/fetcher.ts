export default async function fetcher(url: string) {
  const res = await fetch(url);
  if (res.ok) {
    return res.json();
  }
  throw new Error(`HTTP Error ${res.status}`);
}
