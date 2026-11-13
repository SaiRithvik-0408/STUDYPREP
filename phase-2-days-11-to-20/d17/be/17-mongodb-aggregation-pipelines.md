# Day 17: Backend Engineering & MongoDB Aggregation Pipelines

Aggregation pipelines process documents through sequential multi-stage transformations:

```javascript
db.orders.aggregate([
  // Stage 1: Filter completed orders
  { $match: { status: "COMPLETED" } },

  // Stage 2: Join with customer details
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" },

  // Stage 3: Group by country and compute total revenue
  {
    $group: {
      _id: "$customer.country",
      totalRevenue: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 }
    }
  },

  // Stage 4: Sort descending
  { $sort: { totalRevenue: -1 } }
]);
```