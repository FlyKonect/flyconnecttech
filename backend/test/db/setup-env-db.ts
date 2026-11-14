// Runs before every database test file, before the app is loaded:
// points the app at the test database and gives it test settings.
import { testDatabaseUrl } from './test-database.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDatabaseUrl;
process.env.AUTH_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.FRONTEND_URL ??= 'http://localhost:3001';
process.env.BACKEND_URL ??= 'http://localhost:4000';
process.env.RATE_LIMITS ??= 'false';
