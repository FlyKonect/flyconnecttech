// Database tests: every *.db-spec.ts file in test/db/, against a real MariaDB.
// Run with "npm run test:db". The Docker database must be running.

import base from './jest.config.mjs';

/** @type {import('jest').Config} */
export default {
  ...base,
  testRegex: 'test/db/.*\\.db-spec\\.ts$',
  globalSetup: '<rootDir>/test/db/global-setup.ts',
  testTimeout: 60_000,
};
