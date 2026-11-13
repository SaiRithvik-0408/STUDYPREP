# Day 11: DevOps & Docker Volume Disaster Recovery

Named volumes live in `/var/lib/docker/volumes/`. In production, you must have automated backup scripts to export volume data to remote storage (AWS S3).

---

## 1. The Ephemeral Container Backup Trick

```bash
# 1. Create a tarball backup of the volume 'pgdata' into the current directory
docker run --rm \
  -v pgdata:/volume_data:ro \
  -v $(pwd):/backup \
  alpine \
  tar -czvf /backup/pgdata_backup_$(date +%Y%m%d).tar.gz -C /volume_data .

# 2. Restore volume from tarball into a fresh volume 'pgdata_new'
docker volume create pgdata_new

docker run --rm \
  -v pgdata_new:/volume_data \
  -v $(pwd):/backup \
  alpine \
  tar -xzvf /backup/pgdata_backup_20261113.tar.gz -C /volume_data
```