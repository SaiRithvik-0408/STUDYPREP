# Day 18: Backend Engineering & The MongoDB ESR Rule

When building compound indexes on queries combining filters, sorts, and ranges:

### The ESR Rule Order:
1. **Equality**: Exact match fields (`status: 'ACTIVE'`).
2. **Sort**: Order-by fields (`sort({ createdAt: -1 })`).
3. **Range**: Range filters (`age: { $gte: 21 }`).

```javascript
// Query:
db.users.find({ status: "ACTIVE", age: { $gte: 21 } }).sort({ createdAt: -1 });

// Correct Compound Index:
db.users.createIndex({ status: 1, createdAt: -1, age: 1 });
```