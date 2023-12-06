import express from 'express';

/**
 * Encodes an object as url-encoded string.
 */
function encodeUrl(obj: Record<string, any>) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const encKey = encodeURIComponent(key);
    const encValue = encodeURIComponent(value);
    return `${acc ? `${acc}&` : ''}${encKey}=${encValue}`;
  }, '');
}

/**
 * Encodes an object as JSON
 */
function encodeJson(obj: Record<string, any>) {
  return JSON.stringify(obj);
}

/**
 * Encodes an express request body based on the content type header.
 */
export function encodeRequestBody(req: express.Request) {
  const contentType = req.headers['content-type'];

  if (contentType?.includes('application/x-www-form-urlencoded')) {
    return encodeUrl(req.body);
  }

  if (contentType?.includes('application/json')) {
    return encodeJson(req.body);
  }

  return req.body;
}
