# Day 23: Backend Engineering & Database Sharding

* **Table Partitioning (Single DB)**: Slicing a huge table by date or range into child tables (`orders_2026_q1`).
* **Database Sharding (Multi-Server)**: Distributing rows across different physical servers using a **Shard Key** (`hash(userId) % numberOfShards`).