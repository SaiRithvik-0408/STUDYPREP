# Day 19: DevOps & Multi-Architecture Builds

Developers on Apple Silicon (M1/M2/M3 - ARM64) pushing containers to AWS EC2 (x86_64 - AMD64) encounter `exec format error`.

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myorg/api:1.0 --push .
```