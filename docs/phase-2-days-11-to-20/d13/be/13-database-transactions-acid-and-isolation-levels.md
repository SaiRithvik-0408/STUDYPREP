# Day 13: Backend Engineering & Database ACID Transactions

When multiple concurrent requests read and write to the same database row (e.g. reserving an airline seat or deducting an e-commerce balance), race conditions corrupt data.

---

## 1. The 4 Isolation Levels in SQL

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Serialization Anomaly |
| :--- | :--- | :--- | :--- | :--- |
| **Read Uncommitted** | Allowed | Allowed | Allowed | Allowed |
| **Read Committed** (Postgres default) | **Prevented** | Allowed | Allowed | Allowed |
| **Repeatable Read** | **Prevented** | **Prevented** | **Prevented** (in Postgres MVCC) | Allowed |
| **Serializable** | **Prevented** | **Prevented** | **Prevented** | **Prevented** |

---

## 2. Preventing Race Conditions with Pessimistic Locking (`SELECT FOR UPDATE`)

```typescript
// Atomic balance transfer inside a transaction:
await prisma.$transaction(async (tx) => {
  // Lock the user row exclusively! Other transactions wait until this transaction commits!
  const sender = await tx.$queryRaw`SELECT * FROM accounts WHERE id = ${senderId} FOR UPDATE`;

  if (sender.balance < amount) {
    throw new Error('INSUFFICIENT_FUNDS');
  }

  await tx.account.update({ where: { id: senderId }, data: { balance: { decrement: amount } } });
  await tx.account.update({ where: { id: receiverId }, data: { balance: { increment: amount } } });
});
```