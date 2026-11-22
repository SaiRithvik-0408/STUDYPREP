# Day 15: DevOps & Container Vulnerability Auditing

Before deploying to production, run static security analysis:

```bash
# 1. Lint Dockerfile for bad practices
hadolint Dockerfile

# 2. Scan image for CVE vulnerabilities
trivy image --severity HIGH,CRITICAL my-api:1.0.0
```