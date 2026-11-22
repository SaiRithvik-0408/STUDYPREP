# Day 24: Backend Engineering & Distributed Systems Theorems

### 1. The CAP Theorem
In a distributed network with network partitions ($P$):
* **CP (Consistency + Partition Tolerance)**: System rejects writes rather than serve stale data (e.g. MongoDB, HBase, Spanner).
* **AP (Availability + Partition Tolerance)**: System accepts writes, returning possibly stale data (e.g. DynamoDB, Cassandra, CouchDB).

### 2. PACELC Theorem
If **P**artition: choose **A**vailability or **C**onsistency; **E**lse: choose **L**atency or **C**onsistency.