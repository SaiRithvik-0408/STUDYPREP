# Day 14: Backend Engineering & Enterprise Caching Strategies

Beyond Cache-Aside (Lazy Loading), enterprise architectures choose between:
* **Write-Through**: Write to cache and database synchronously. Cache is never stale.
* **Write-Behind (Write-Back)**: Write to cache immediately and queue database writes asynchronously via Redis/Kafka (Highest write throughput).
* **Redis Pub/Sub Invalidation**: When any server node updates a record, it publishes a message on channel `cache:invalidate:userId` to purge local in-memory caches across all cluster nodes.