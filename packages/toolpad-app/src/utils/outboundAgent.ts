import agentBase from 'agent-base';
import http from 'http';
import https from 'https';
import dns from 'dns/promises';
import fetch, { Request } from 'node-fetch';

const SLIDING_WINDOW = 1000;
const REQS_PER_WINDOW = 5;

const rateLimiterWindows = new Map<string, number[]>();

// Regular garbage collection for the rateLimiterWindows
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of rateLimiterWindows) {
    if (window.every((timestamp) => timestamp < now - SLIDING_WINDOW)) {
      rateLimiterWindows.delete(key);
    }
  }
}, 5000).unref();

// Basic sliding window rate limiter
// We can build this distributed in redis:
//   https://developer.redis.com/develop/dotnet/aspnetcore/rate-limiting/sliding-window/#sliding-window-rate-limiter-lua-script
async function rateLimit(address: string): Promise<boolean> {
  let window = rateLimiterWindows.get(address) ?? [];
  const now = Date.now();
  window = window.filter((timestamp) => timestamp > now - SLIDING_WINDOW);
  let allowed = true;
  if (window.length >= REQS_PER_WINDOW) {
    allowed = false;
  } else {
    window.push(now);
  }
  rateLimiterWindows.set(address, window);

  return allowed;
}

/**
 * http(s) agent, to be used for user-originated requests. Rate limits and firewalls outbound requests.
 */
function createAgent(key: string) {
  return agentBase(async (req, opts) => {
    if (!opts.host) {
      throw new Error(`Invalid request, missing host`);
    }

    const { address } = await dns.lookup(opts.host);

    const allowed = await rateLimit(`${key}:${address}`);

    if (!allowed) {
      throw new Error('Rate limited');
    }

    return opts.secureEndpoint ? https.globalAgent : http.globalAgent;
  });
}

export function withOutboundRateLimiting(key: string, inner: typeof fetch): typeof fetch {
  const wrapped: typeof fetch = async (...args) => {
    const req = new Request(...args);
    req.agent = createAgent(key);
    return inner(req);
  };

  wrapped.isRedirect = inner.isRedirect;

  return wrapped;
}
