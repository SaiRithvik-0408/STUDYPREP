# Day 9: DevOps & Nginx as a Reverse Proxy (SSL Termination & Load Balancing)

In production architectures, **Node.js servers must never be exposed directly to public internet traffic on port 80/443**. Placing **Nginx** in front of your Node.js application is standard industry security.

---

## 1. Why Place Nginx in Front of Node.js?

```
Public Internet ──► [ Nginx (Reverse Proxy) ] ──(Private Bridge)──► [ Node.js API (Port 3000) ]
                    ├── SSL/TLS Termination
                    ├── Gzip / Brotli Compression
                    ├── Static File Caching
                    └── DDoS / Slowloris Protection
```

1. **Slowloris Attack Protection**: If an attacker opens 10,000 HTTP connections and sends 1 byte every 10 seconds, single-threaded Node.js exhausts its event loop connection limit. Nginx uses event-driven asynchronous socket buffering to soak up thousands of slow connections without passing them to Node.js until the full request headers are received.
2. **SSL Termination**: Decrypting TLS certificates consumes CPU cycles. Offloading SSL decryption to Nginx allows your Node.js processes to dedicate 100% of their CPU power to business logic.
3. **Load Balancing**: Nginx can distribute incoming traffic across multiple Node.js replica containers.

---

## 2. Production `nginx.conf` Configuration

```nginx
events {
  worker_connections 1024;
}

http {
  # Define upstream cluster of Node.js container instances
  upstream node_cluster {
    least_conn; # Route traffic to container with least active connections
    server web-api-1:3000 max_fails=3 fail_timeout=10s;
    server web-api-2:3000 max_fails=3 fail_timeout=10s;
  }

  # Rate limiting zone: max 10 requests per second per IP
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

  server {
    listen 80;
    server_name api.myproductionapp.com;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name api.myproductionapp.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/api.myproductionapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.myproductionapp.com/privkey.pem;

    # Modern SSL security protocols
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Reverse proxy to Node.js upstream cluster
    location / {
      limit_req zone=api_limit burst=20 nodelay;

      proxy_pass http://node_cluster;
      proxy_http_version 1.1;

      # Forward real client IP and headers
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_read_timeout 60s;
    }
  }
}
```
