# Day 13: DevOps & Container Registries

Deploying to cloud servers requires publishing versioned image tags to private registries.

```bash
# 1. Authenticate with AWS Elastic Container Registry (ECR)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# 2. Tag image with Git commit SHA and version
docker tag my-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/my-api:v1.2.0

# 3. Push to registry
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-api:v1.2.0
```