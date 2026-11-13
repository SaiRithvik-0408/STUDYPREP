# Day 10: Backend Engineering & Production API Security Hardening

Before deploying any full-stack app to production, senior engineers must audit the backend against the **OWASP Top 10 API Security Risks**.

---

## 1. Production Express Security Stack

Here is the hardened production Express server template:

```typescript
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Helmet: Sets 15+ secure HTTP response headers automatically
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
      },
    },
    crossOriginEmbedderPolicy: true,
  })
);

// 2. Strict CORS Whitelist (Never use origin: '*' in production!)
const allowedOrigins = [
  'https://myproductionapp.com',
  'https://admin.myproductionapp.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS: Origin blocked by policy.'));
      }
    },
    credentials: true, // Allow cookies across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parser Limits: Prevents memory exhaustion DDoS
app.use(express.json({ limit: '100kb' })); // Max 100KB JSON payloads!
app.use(cookieParser());

// 4. Global Edge Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// 5. Centralized Production Error Handler (Masks stack traces!)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log full stack trace internally for monitoring (Sentry / Datadog)
  console.error(`[Server Error] ${req.method} ${req.url}:`, err);

  // Return clean, safe error message to client (Never leak stack trace!)
  res.status(err.status || 500).json({
    error: {
      message: isProduction ? 'An unexpected internal error occurred.' : err.message,
      code: err.code || 'INTERNAL_ERROR',
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
});

export default app;
```
