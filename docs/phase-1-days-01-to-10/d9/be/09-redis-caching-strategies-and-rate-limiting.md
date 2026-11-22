# Day 9: Backend Engineering & Redis Caching Strategies (Rate Limiting & Mutexes)

When a PostgreSQL or MongoDB database hits 5,000+ queries per second, disk I/O and connection pools become the bottleneck. **Redis** (Remote Dictionary Server) operates entirely in RAM, executing 100,000+ operations per second with sub-millisecond latency.

---

## 1. The Cache-Aside (Lazy Loading) Architecture

```
Client Request ──► [ API Server ]
                         │
        ┌────────────────┴────────────────┐
        ▼ (Step 1: Check Cache)           ▼ (If Cache Miss)
[ Redis In-Memory Cache ]          [ PostgreSQL Database ]
   │ (Cache Hit: Return in 0.5ms)         │
   ▼                                      ▼ (Fetch from disk: 25ms)
Return Data to Client             Write Data to Redis with TTL ──► Return Data
```

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getUserProfile(userId: string): Promise<any> {
  const cacheKey = `user:profile:${userId}`;

  // Step 1: Check Redis cache
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData); // Cache Hit!
  }

  // Step 2: Cache Miss -> Query primary database
  const user = await db.user.findUnique({ where: { id: userId } });

  if (user) {
    // Step 3: Write to Redis with a 10-minute TTL (Time-To-Live)
    await redis.set(cacheKey, JSON.stringify(user), 'EX', 600);
  }

  return user;
}
```

---

## 2. The Cache Stampede (Dogpiling) Problem

When a hot cache key expires (e.g. `homepage:trending_products` viewed by 50,000 users/sec):
* All 50,000 requests experience a simultaneous cache miss.
* All 50,000 requests hammer the primary PostgreSQL database simultaneously.
* The database CPU spikes to 100% and crashes (Cascading Failure).

### The Solution: Distributed Mutex Lock (Redlock pattern)
Only **one single request** is permitted to query the database and rebuild the cache; all other incoming requests wait or receive stale data:

```typescript
async function getWithMutex(key: string, fetchFn: () => Promise<any>, ttl = 300) {
  const data = await redis.get(key);
  if (data) return JSON.parse(data);

  const lockKey = `lock:${key}`;
  // Acquire distributed lock: NX = Only set if Not eXists, PX = expire in 5000ms
  const acquired = await redis.set(lockKey, 'locked', 'NX', 'PX', 5000);

  if (acquired) {
    try {
      const freshData = await fetchFn();
      await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
      return freshData;
    } finally {
      await redis.del(lockKey); // Release lock
    }
  } else {
    // Another worker is rebuilding the cache: wait 50ms and retry reading
    await new Promise((resolve) => setTimeout(resolve, 50));
    return getWithMutex(key, fetchFn, ttl);
  }
}
```

---

## 3. Sliding Window Rate Limiter using Redis Sorted Sets (`ZSET`)

To prevent DDoS and API abuse, senior engineers use **Sliding Window Rate Limiters** stored in Redis `ZSET` where the **score is the Unix timestamp**:

```typescript
export async function isRateLimited(
  userId: string,
  limit = 100, // 100 requests
  windowSeconds = 60 // per 60 seconds
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${userId}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const pipeline = redis.pipeline();

  // 1. Remove all timestamps older than the active sliding window
  pipeline.zremrangebyscore(key, 0, windowStart);

  // 2. Add current request timestamp
  pipeline.zadd(key, now, `${now}-${Math.random()}`);

  // 3. Count total requests currently in the window
  pipeline.zcard(key);

  // 4. Set key expiration to avoid dangling memory
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = results![2][1] as number;

  return {
    allowed: requestCount <= limit,
    remaining: Math.max(0, limit - requestCount),
  };
}
```
