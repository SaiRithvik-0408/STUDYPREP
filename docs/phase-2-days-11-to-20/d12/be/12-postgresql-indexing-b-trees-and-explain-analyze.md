# Day 12: Backend Engineering & PostgreSQL B-Tree Indexing

Without indexes, PostgreSQL must scan every single physical page on disk (**Sequential Scan** $O(N)$). With B-Tree indexes, lookups drop to **$O(\log N)$**.

---

## 1. B-Tree Index Physical Storage

A B-Tree (Balanced Tree) in PostgreSQL is self-balancing with high fanout:
```
                     [ Root Page: Keys (100, 500) ]
                            /         |          \
             [ Internal: (10, 50) ]  [...]   [ Internal: (600, 900) ]
                   /       \                     /         \
              [ Leaf ]    [ Leaf ]          [ Leaf ]      [ Leaf ]
           (Points directly to Heap Tuple ID: (BlockNumber, OffsetIndex))
```

### Reading `EXPLAIN ANALYZE` Output:
1. **Seq Scan**: Database inspected every row sequentially.
2. **Index Scan**: Database traversed B-tree leaf nodes and read the exact disk block.
3. **Index Only Scan**: All requested columns exist directly in the index itself! Database never touched table heap storage!