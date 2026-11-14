// Runs before every whole-app test file, before the app is loaded.
//
// The app reads its settings the moment it is loaded, so the test values must
// be set here and not inside a test. Without this, the tests only pass on a PC
// that has a backend/.env file, and fail on GitHub, which has none.
//
// No real database is needed: each test replaces the database with a stand-in.
process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'mysql://test:test@localhost:3306/test';
process.env.AUTH_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.RATE_LIMITS ??= 'false';
