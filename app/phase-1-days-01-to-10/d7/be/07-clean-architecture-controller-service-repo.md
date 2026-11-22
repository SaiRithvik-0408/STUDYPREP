# Day 7: Backend Engineering & Clean 3-Tier Architecture (Controller-Service-Repository)

A hallmark of a senior backend engineer is knowing where code belongs. Mixing database queries, password hashing, and HTTP response handling inside an Express router handler leads to spaghetti code that is impossible to test or maintain.

---

## 1. The 3-Tier Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│ 1. CONTROLLER LAYER (HTTP / Transport Layer)           │
│    - Extracts req.body, req.params, req.headers        │
│    - Validates schema with Zod                         │
│    - Returns HTTP Status Codes (200, 201, 400, 404)    │
│    - *Zero database queries! Zero business logic!*     │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. SERVICE LAYER (Pure Domain Business Logic)          │
│    - Enforces business rules (e.g. check duplicate)    │
│    - Hashes passwords, handles Stripe payments         │
│    - Coordinates multiple repositories & transactions  │
│    - *Zero knowledge of Express or HTTP req/res!*      │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. REPOSITORY LAYER (Data Persistence Abstraction)     │
│    - Talks directly to Database (PostgreSQL, Prisma)   │
│    - Executes SQL, handles indexes, manages connection │
│    - *Zero business rules!*                            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Production Implementation with Dependency Injection

### Layer 1: The Repository Interface & Implementation
```typescript
// IUserRepository.ts
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(email: string, passwordHash: string): Promise<UserRecord>;
}

// PostgresUserRepository.ts
export class PostgresUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    // In real app: return prisma.user.findUnique({ where: { email } });
    return null;
  }

  async create(email: string, passwordHash: string): Promise<UserRecord> {
    return { id: 'usr_' + Date.now(), email, passwordHash };
  }
}
```

### Layer 2: The Business Service Layer (Pure & Testable)
```typescript
// UserService.ts
import bcrypt from 'bcrypt';
import { IUserRepository, UserRecord } from './IUserRepository';

export class UserService {
  // Dependency Injection: Repository is passed in via constructor!
  constructor(private userRepo: IUserRepository) {}

  async registerUser(email: string, rawPassword: string): Promise<UserRecord> {
    // Business Rule 1: Check duplicate email
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Business Rule 2: Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    // Business Rule 3: Persist record
    return await this.userRepo.create(email, passwordHash);
  }
}
```

### Layer 3: The Express Controller Layer
```typescript
// UserController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from './UserService';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class UserController {
  constructor(private userService: UserService) {}

  register = async (req: Request, res: Response) => {
    try {
      // 1. Validate HTTP body
      const { email, password } = RegisterSchema.parse(req.body);

      // 2. Delegate to business service
      const newUser = await this.userService.registerUser(email, password);

      // 3. Return HTTP response
      return res.status(201).json({
        success: true,
        data: { id: newUser.id, email: newUser.email },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'VALIDATION_FAILED', details: err.format() });
      }
      if (err.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ error: 'Conflict: Email already registered' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
```

### Why Senior Engineers Build This Way:
* **100% Unit Testable**: You can test `UserService` in milliseconds by passing a mock in-memory repository object without running a physical database!
* **Decoupled**: If you switch from PostgreSQL to MongoDB, you only rewrite the repository file; your controllers and business services remain untouched.
