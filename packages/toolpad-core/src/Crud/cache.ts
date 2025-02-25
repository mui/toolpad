export type DataSourceCacheConfig = {
  /**
   * Time To Live for each cache entry in milliseconds.
   * After this time the cache entry will become stale and the next query will result in cache miss.
   * @default 300000 (5 minutes)
   */
  ttl?: number;
};

export class DataSourceCache {
  private cache: Record<string, { value: unknown; expiry: number }>;

  private ttl: number;

  constructor(config?: DataSourceCacheConfig) {
    this.cache = {};
    this.ttl = config?.ttl ?? 300000;
  }

  set(key: string, value: unknown) {
    const expiry = Date.now() + this.ttl;
    this.cache[key] = { value, expiry };
  }

  get(key: string): unknown | undefined {
    const entry = this.cache[key];
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      delete this.cache[key];
      return undefined;
    }

    return entry.value;
  }

  clear() {
    this.cache = {};
  }
}
