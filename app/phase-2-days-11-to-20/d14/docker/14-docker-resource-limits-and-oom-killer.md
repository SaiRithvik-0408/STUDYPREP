# Day 14: DevOps & Resource Limits in Docker

If an Express app has a memory leak, it can consume 100% of the host server RAM, causing the Linux kernel to trigger the **OOM-Killer (Out-Of-Memory Killer)**, killing critical OS processes.

```yaml
services:
  api:
    image: my-api:latest
    deploy:
      resources:
        limits:
          memory: 512M # Hard ceiling: Container is killed if it exceeds 512MB
        reservations:
          memory: 256M # Minimum guaranteed memory allocated by host
```