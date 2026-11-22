# Day 26: System Design (HLD) & Load Balancing

* **L4 Load Balancer (Transport Layer)**: Routes traffic based on TCP/UDP ports and IP addresses without decrypting SSL (Millions of req/s; e.g. AWS Network Load Balancer).
* **L7 Load Balancer (Application Layer)**: Inspects HTTP headers, cookies, URL paths, and query parameters (e.g. AWS Application Load Balancer, Nginx).