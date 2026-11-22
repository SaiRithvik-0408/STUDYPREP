# Day 8: Backend Engineering & Enterprise Authentication (JWT + Refresh Tokens)

The most common security vulnerability in junior/mid full-stack apps is storing JWT tokens in `localStorage`. If an attacker executes a single Cross-Site Scripting (XSS) payload via a compromised npm package or input field, they can run `localStorage.getItem('token')` and permanently hijack the session.

---

## 1. The Dual-Token Security Architecture

```
┌────────────────────────────────────────────────────────┐
│ 1. ACCESS TOKEN (Short-Lived: 10 - 15 Minutes)         │
│    - Standard signed JSON Web Token (JWT)              │
│    - Contains userId, roles, expiration timestamp      │
│    - Stored ONLY in browser memory (JavaScript state)  │
│    - Sent via: `Authorization: Bearer <token>`         │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (When Access Token Expires)
┌────────────────────────────────────────────────────────┐
│ 2. REFRESH TOKEN (Long-Lived: 7 - 30 Days)             │
│    - Random cryptographic string or signed token       │
│    - Stored in Database (can be revoked by admin!)     │
│    - Transmitted via: `httpOnly, Secure, SameSite`     │
│      HTTP Cookie.                                      │
│    - *JavaScript cannot touch it! Immune to XSS!*      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Setting Secure Cookies in Node.js / Express

```typescript
import { Response } from 'express';

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // 1. Prevents client JavaScript from reading the cookie (Stops XSS)
    secure: process.env.NODE_ENV === 'production', // 2. Sent only over encrypted HTTPS
    sameSite: 'strict', // 3. Prevents browser from sending cookie on third-party cross-site requests (Stops CSRF)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/v1/auth/refresh', // 4. Cookie only sent to the refresh endpoint!
  });
}
```

---

## 3. The Silent Token Refresh Interceptor (Frontend Architecture)

When an access token expires, API requests return `401 Unauthorized`. A production frontend automatically pauses pending requests, calls `/refresh`, updates the in-memory access token, and retries the original request seamlessly:

```typescript
import axios from 'axios';

let inMemoryAccessToken: string | null = null;

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Mandatory: Tells browser to include cookies in cross-origin requests
});

// Request Interceptor: Attach in-memory access token
apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

// Response Interceptor: Catch 401 and refresh automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (Cookie is automatically sent by browser)
        const refreshResponse = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        inMemoryAccessToken = refreshResponse.data.accessToken;

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Refresh token is expired or revoked: force user to log in again
        inMemoryAccessToken = null;
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
```
