import fetch from 'node-fetch';
import { test, expect } from '../playwright/test';

const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

test('can render in an iframe', async ({ baseURL }) => {
  if (browserName !== 'chromium') {
    test.skip(true, 'No use, test HTTP statuses');
  }

  const response = await fetch(`${baseURL}deploy/cl9bp4czk00019kt2grzr5m3u/pages/l11ao9l`, {
    headers: { 'User-Agent': userAgent },
    method: 'HEAD',
    redirect: 'manual',
  });
  expect(response.status).toBe(404);
  expect(response.headers.get('X-Frame-Options')).toBe(null);
});
