# Day 12: DevOps & Secrets Security in Containers

Putting database passwords in `ENV DATABASE_PASSWORD=secret` leaks credentials into `docker inspect` outputs and image layers.

---

## 1. Secrets Management via Files
Enterprise container orchestrators mount secrets as in-memory files at `/run/secrets/`:

```yaml
services:
  api:
    image: my-api:latest
    secrets:
      - db_password

secrets:
  db_password:
    file: ./db_password.txt
```