# Day 16: DevOps & Docker Log Rotation

If an application outputs 100 log lines per second, Docker's default logging will write gigabytes of JSON files until the server disk runs out of space.

```yaml
services:
  api:
    image: my-api:latest
    logging:
      driver: "json-file"
      options:
        max-size: "20m" # Rotate after 20MB
        max-file: "5"   # Keep at most 5 files (Max 100MB disk usage)
```