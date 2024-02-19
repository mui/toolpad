import type express from 'express';

export function encodeRequestBody(req: express.Request) {
  const contentType = req.headers['content-type'];

  if (typeof req.body === 'object' && contentType?.includes('application/x-www-form-urlencoded')) {
    return Object.entries(req.body as Record<string, string | number | boolean>).reduce(
      (acc, [key, value]) => {
        const encKey = encodeURIComponent(key);
        const encValue = encodeURIComponent(value);
        return `${acc ? `${acc}&` : ''}${encKey}=${encValue}`;
      },
      '',
    );
  }

  if (contentType?.includes('application/json')) {
    return JSON.stringify(req.body);
  }

  return req.body;
}

export function adaptRequestFromExpressToFetch(req: express.Request) {
  // Converting Express req headers to Fetch API's Headers
  const headers = new Headers();
  for (const headerName of Object.keys(req.headers)) {
    const headerValue: string = req.headers[headerName]?.toString() ?? '';
    if (Array.isArray(headerValue)) {
      for (const value of headerValue) {
        headers.append(headerName, value);
      }
    } else {
      headers.append(headerName, headerValue);
    }
  }

  // Creating Fetch API's Request object from Express' req
  return new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
    method: req.method,
    headers,
    body: /GET|HEAD/.test(req.method) ? undefined : encodeRequestBody(req),
  });
}
