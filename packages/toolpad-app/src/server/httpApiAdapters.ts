import express from 'express';

/**
 * Encodes an express request body based on the content type header.
 */
export function encodeRequestBody(req: express.Request) {
  const contentType = req.headers['content-type'];

  if (contentType?.includes('application/x-www-form-urlencoded')) {
    return Object.entries(req.body as Record<string, any>).reduce((acc, [key, value]) => {
      const encKey = encodeURIComponent(key);
      const encValue = encodeURIComponent(value);
      return `${acc ? `${acc}&` : ''}${encKey}=${encValue}`;
    }, '');
  }

  if (contentType?.includes('application/json')) {
    return JSON.stringify(req.body);
  }

  return req.body;
}
