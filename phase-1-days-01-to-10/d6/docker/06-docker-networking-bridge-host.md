# Day 6: DevOps & Docker Networking Under the Hood (Bridge vs Host)

When you type `docker run -p 8080:3000`, what actually happens in the Linux kernel network stack? This guide explains **Docker Network Drivers**, virtual ethernet (`veth`) pairs, and `iptables` NAT routing.

---

## 1. The 4 Docker Network Drivers

```
┌────────────────────────────────────────────────────────┐
│ 1. BRIDGE DRIVER (Default Isolated Network)            │
│    - Creates private subnet (e.g. 172.17.0.0/16).      │
│    - Uses virtual ethernet (veth) pairs.               │
│    - Requires port forwarding (-p 8080:3000).          │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 2. HOST DRIVER (Zero Network Isolation)                │
│    - Container shares the host server's network stack. │
│    - No port mapping needed (app listening on port 3000│
│      is directly accessible on host port 3000).        │
│    - Highest throughput, lowest latency.               │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 3. NONE DRIVER (Air-Gapped / Isolated)                 │
│    - Container has no network interface except loopback│
│    - Used for batch security processing.               │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 4. OVERLAY DRIVER (Multi-Host Networking)              │
│    - Connects containers across different physical     │
│      machines in Docker Swarm or Kubernetes clusters.  │
└────────────────────────────────────────────────────────┘
```

---

## 2. How the Bridge Network Works: `veth` Pairs & `iptables`

When Docker starts a container on a bridge network:
1. Docker creates a Linux **Virtual Ethernet Pair (`veth`)**:
   * One end of the virtual cable attaches to the container's private `eth0` network interface.
   * The other end attaches to the host's virtual switch bridge (`docker0`).
2. When you run `-p 8080:3000`:
   * Docker inserts an **`iptables` DNAT (Destination Network Address Translation)** rule into the Linux kernel routing table.
   * Any incoming packet arriving at host port `8080` has its destination IP rewritten to the container's private IP (`172.17.0.2:3000`).

```
Internet Request ──► Host IP (Port 8080)
                             │
                             ▼ (iptables NAT Rule)
                   Bridge docker0 (172.17.0.1)
                             │
                             ▼ (veth pair)
             Container eth0 (172.17.0.2:3000)
```

---

## 3. Creating Custom Isolated Bridge Networks

Never use Docker's default `bridge` network for production services. The default bridge does **not support automatic DNS resolution by container name**. Always create custom bridge networks:

```bash
# 1. Create a secure, isolated bridge network
docker network create --driver bridge microservices-net

# 2. Run backend on this network
docker run -d --name api-backend --network microservices-net my-api:1.0

# 3. Run database on the same network
docker run -d --name db-postgres --network microservices-net postgres:16

# Now api-backend can communicate with db-postgres directly via hostname:
# "postgres://user:pass@db-postgres:5432/db"
```
