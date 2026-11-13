# Day 16: Backend Engineering & MongoDB WiredTiger Engine

MongoDB is a document database backed by the **WiredTiger** storage engine.

---

## 1. Key Storage Engine Concepts
* **BSON (Binary JSON)**: Supports timestamps, floating points, regex, and binary Buffers natively.
* **16 MB Document Limit**: A single BSON document cannot exceed 16MB. Storing arrays of unbounded comments directly inside a post document is a major anti-pattern! Use parent referencing instead.
* **WiredTiger Checkpoints**: Writes data to memory cache first; flushes to disk every 60 seconds (or 2GB of dirty data). Journaling protects against power outages.