# Day 15: Backend Engineering & Redis Lua Scripting

When implementing distributed locks or rate limiters across multi-node server clusters, sending multiple separate Redis commands creates race conditions. **Redis executes Lua scripts atomically in a single clock cycle**.

```typescript
const rateLimiterLua = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local current = tonumber(redis.call('get', key) or "0")

  if current + 1 > limit then
    return 0
  else
    redis.call('incrby', key, 1)
    if current == 0 then
      redis.call('expire', key, 60)
    end
    return 1
  end
`;

// Execute atomically in Redis:
const allowed = await redis.eval(rateLimiterLua, 1, 'rate:user:101', 5);
```