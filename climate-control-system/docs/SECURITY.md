# Security Guide

## Authentication and Authorization

- JWT access token for API authorization.
- User roles: admin, user.
- Admin-only control endpoints for critical command operations.

## Input Validation

- Zod schemas at route boundaries.
- All telemetry and auth payloads validated before service execution.

## Error Handling

- Centralized middleware for controlled error responses.
- Internal details kept in logs, sanitized errors returned to clients.

## Device Security Recommendations

- Use per-device API keys (store hash in database).
- Rotate API keys periodically.
- Restrict ingest endpoint by known device identity.

## Hardening Checklist

1. Enforce HTTPS in production.
2. Apply strict CORS origins.
3. Add request rate limiting and IP allowlist for ingest route.
4. Add brute-force protection for auth routes.
5. Move secrets to managed secret store.
