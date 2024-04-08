import express from 'express';
import { listen } from '@toolpad/utils/http';

export async function startTestServer(port?: number) {
  const app = express();

  const fromRawHeaders = (headers: string[]) => {
    const result: Record<string, string> = {};
    for (let i = 0; i < headers.length; i += 2) {
      result[headers[i]] = headers[i + 1];
    }
    return result;
  };

  app.use('/get', (req, res) => {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    res.json({
      args: req.query,
      headers: fromRawHeaders(req.rawHeaders),
      origin: req.socket.remoteAddress,
      url: url.href,
    });
  });

  app.use('/post', express.raw({ type: '*/*' }), (req, res) => {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    const body = String(req.body);
    res.json({
      args: req.query,
      headers: fromRawHeaders(req.rawHeaders),
      origin: req.socket.remoteAddress,
      url: url.href,
      data: body,
      files: {},
      form: {},
      json: JSON.parse(body),
    });
  });

  return listen(app, port);
}
