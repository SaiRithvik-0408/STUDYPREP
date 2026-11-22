# Day 22: Backend Engineering & Message Queues (BullMQ)

Never process heavy tasks (video encoding, sending 10,000 push notifications) inside synchronous HTTP requests.

---

## 1. Producer / Worker Architecture with BullMQ
```typescript
import { Queue, Worker } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

// Producer: Adds job to queue and returns HTTP 202 Accepted immediately!
export const emailQueue = new Queue('email-queue', { connection });
await emailQueue.add('sendWelcomeEmail', { userId: '101', email: 'alex@example.com' });

// Background Worker: Processes jobs with automatic retry & exponential backoff
const worker = new Worker('email-queue', async (job) => {
  console.log(`Sending email to ${job.data.email}`);
  await sendEmail(job.data);
}, { connection, concurrency: 5 });
```